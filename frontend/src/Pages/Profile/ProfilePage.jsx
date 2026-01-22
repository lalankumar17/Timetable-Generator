import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../Components/AuthContext';
import { useAlert } from '../../Components/AlertContextProvider';
import { url } from '../../Script/fetchUrl';
import '../../Style/UnifiedPages.css';
import './ProfilePage.css';

const ProfilePage = () => {
    const { user, updateUser } = useAuth();
    
    // Helper to extract pos from custom string format: base64#meta={...}
    const extractPhotoData = (photoStr) => {
        if (!photoStr) return { url: '', pos: { x: 50, y: 50 }, zoom: 1 };
        const parts = photoStr.split('#meta=');
        if (parts.length > 1) {
            try {
                const meta = JSON.parse(decodeURIComponent(parts[1]));
                return { url: parts[0], pos: meta.pos || { x: 50, y: 50 }, zoom: meta.zoom || 1 };
            } catch {
                return { url: parts[0], pos: { x: 50, y: 50 }, zoom: 1 };
            }
        }
        // Fallback for previous '|meta=' logic just in case there's old data
        const oldParts = photoStr.split('|meta=');
        if (oldParts.length > 1) {
            try {
                const meta = JSON.parse(oldParts[1]);
                return { url: oldParts[0], pos: meta.pos || { x: 50, y: 50 }, zoom: meta.zoom || 1 };
            } catch {
                return { url: oldParts[0], pos: { x: 50, y: 50 }, zoom: 1 };
            }
        }
        return { url: photoStr, pos: { x: 50, y: 50 }, zoom: 1 };
    };

    const initialCover = extractPhotoData(user?.coverPhoto);
    const initialProfile = extractPhotoData(user?.profilePicture);

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        username: user?.username || '',
        name: user?.name || '',
        email: user?.email || '',
        designation: user?.designation || '',
        department: user?.department || '',
        phoneNumber: user?.phoneNumber || '',
        profilePicture: initialProfile.url || '',
        coverPhoto: initialCover.url || '',
        bio: user?.bio || ''
    });
    const [isLoading, setIsLoading] = useState(false);
    const { showSuccess, showError } = useAlert();

    // Repositioning State
    const bannerRef = useRef(null);
    const bioInputRef = useRef(null);
    const designationInputRef = useRef(null);
    const [isRepositioning, setIsRepositioning] = useState(false);
    const [tempCoverPhoto, setTempCoverPhoto] = useState(null);
    const [repositionPos, setRepositionPos] = useState(initialCover.pos);
    const [isDragging, setIsDragging] = useState(false);
    const dragStart = useRef({ x: 0, y: 0 });

    // Profile Repositioning State
    const profileImageRef = useRef(null);
    const [isRepositioningProfile, setIsRepositioningProfile] = useState(false);
    const [tempProfilePhoto, setTempProfilePhoto] = useState(null);
    const [profileRepositionPos, setProfileRepositionPos] = useState(initialProfile.pos);
    const [profileZoom, setProfileZoom] = useState(initialProfile.zoom);
    const [isDraggingProfile, setIsDraggingProfile] = useState(false);
    const profileDragStart = useRef({ x: 0, y: 0 });

    // Cover Photo Menu State
    const [showCoverMenu, setShowCoverMenu] = useState(false);
    const coverMenuRef = useRef(null);

    // Helper to get initials
    const getInitials = (fullName) => {
        if (!fullName) return '';
        const names = fullName.trim().split(/\s+/);
        if (names.length === 0) return '';
        if (names.length === 1) return names[0].charAt(0).toUpperCase();
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    const renderBioWithLinks = (text) => {
        if (!text) return null;

        const parts = String(text).split(/(https?:\/\/[^\s]+|www\.[^\s]+)/gi);
        return parts.map((part, index) => {
            const isUrl = /^(https?:\/\/|www\.)/i.test(part);
            if (!isUrl) {
                return <span key={`bio-text-${index}`}>{part}</span>;
            }

            const href = /^https?:\/\//i.test(part) ? part : `https://${part}`;
            return (
                <a
                    key={`bio-link-${index}`}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {part}
                </a>
            );
        });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === 'username') {
            const sanitized = value.replace(/[^a-zA-Z0-9_.]/g, '').toLowerCase();
            setFormData(prev => ({ ...prev, [name]: sanitized }));
            return;
        }
        // Name: only allow letters, spaces, and dots (no numbers, underscores)
        if (name === 'name') {
            const sanitizedName = value.replace(/[^a-zA-Z\s.]/g, '');
            setFormData(prev => ({ ...prev, [name]: sanitizedName }));
            return;
        }
        // Phone: only digits, max 10
        if (name === 'phoneNumber') {
            const digitsOnly = value.replace(/[^0-9]/g, '').slice(0, 10);
            setFormData(prev => ({ ...prev, [name]: digitsOnly }));
            return;
        }
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {

            const reader = new FileReader();
            reader.onloadend = () => {
                setTempProfilePhoto(reader.result);
                setIsRepositioningProfile(true);
                setProfileRepositionPos({ x: 50, y: 50 });
                setProfileZoom(1);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCoverPhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {

            const reader = new FileReader();
            reader.onloadend = () => {
                setTempCoverPhoto(reader.result);
                setIsRepositioning(true);
                setRepositionPos({ x: 50, y: 50 }); // Reset position
            };
            reader.readAsDataURL(file);
        }
    };

    // Drag Logic
    const handleMouseDown = (e) => {
        if (!isRepositioning && !isEditing) return;
        e.preventDefault();
        setIsDragging(true);
        dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseMove = (e) => {
        if (!isDragging || (!isRepositioning && !isEditing) || !bannerRef.current) return;

        const deltaX = e.clientX - dragStart.current.x;
        const deltaY = e.clientY - dragStart.current.y;

        const bannerRect = bannerRef.current.getBoundingClientRect();

        // Convert pixel delta to percentage
        const percentX = (deltaX / bannerRect.width) * 100;
        const percentY = (deltaY / bannerRect.height) * 100;

        // Update position (inverted because dragging image moves it)
        // Wait, standard behavior: dragging mouse down moves image down.
        // position 0% is top/left, 100% is bottom/right.
        // Reducing % moves image up/left? No.
        // background-position: 0% 0% -> Image Top-Left aligned with Container Top-Left.
        // background-position: 50% 50% -> Image Center aligned with Container Center.
        // If I drag mouse DOWN, I want image to move DOWN.
        // Effectively shifting the 'view' up.
        // Let's implement simple += and clamp.

        setRepositionPos(prev => ({
            x: Math.min(100, Math.max(0, prev.x - percentX * 2.5)),
            y: Math.min(100, Math.max(0, prev.y - percentY * 2.5))
        }));

        dragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleRemoveCoverPhoto = () => {
        setFormData(prev => ({ ...prev, coverPhoto: '' }));
        setShowCoverMenu(false);
    };



    // Profile Drag Logic
    const handleProfileMouseDown = (e) => {
        if (!isRepositioningProfile && !isEditing) return;
        e.preventDefault();
        setIsDraggingProfile(true);
        profileDragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleProfileMouseMove = (e) => {
        if (!isDraggingProfile || (!isRepositioningProfile && !isEditing) || !profileImageRef.current) return;

        const deltaX = e.clientX - profileDragStart.current.x;
        const deltaY = e.clientY - profileDragStart.current.y;

        const rect = profileImageRef.current.getBoundingClientRect();
        const percentX = (deltaX / rect.width) * 100;
        const percentY = (deltaY / rect.height) * 100;

        // Adjust based on zoom level to make dragging feel natural
        setProfileRepositionPos(prev => ({
            x: Math.min(100, Math.max(0, prev.x - (percentX * 2.5) / profileZoom)),
            y: Math.min(100, Math.max(0, prev.y - (percentY * 2.5) / profileZoom))
        }));

        profileDragStart.current = { x: e.clientX, y: e.clientY };
    };

    const handleProfileMouseUp = () => {
        setIsDraggingProfile(false);
    };






    const [showProfilePhotoMenu, setShowProfilePhotoMenu] = useState(false);
    const profilePhotoMenuRef = useRef(null);

    const handleRemoveProfilePhoto = () => {
        setFormData(prev => ({ ...prev, profilePicture: '' }));
        setShowProfilePhotoMenu(false);
    };

    // Close menus when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (coverMenuRef.current && !coverMenuRef.current.contains(event.target)) {
                setShowCoverMenu(false);
            }
            if (profilePhotoMenuRef.current && !profilePhotoMenuRef.current.contains(event.target)) {
                setShowProfilePhotoMenu(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    if (!user) return null;

    const processImageWithMetadata = (imageSource, pos, zoom = 1) => {
        return new Promise((resolve) => {
            if (!imageSource) {
                resolve(null);
                return;
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Ensure external images don't taint the canvas
            img.src = imageSource;

            img.onload = () => {
                // Scale down logic but NO CROPPING. We preserve the original uncropped ratio to allow dragging anytime!
                const MAX_DIMENSION = 1600;
                let targetWidth = img.width;
                let targetHeight = img.height;

                if (Math.max(targetWidth, targetHeight) > MAX_DIMENSION) {
                    const ratio = MAX_DIMENSION / Math.max(targetWidth, targetHeight);
                    targetWidth *= ratio;
                    targetHeight *= ratio;
                }

                canvas.width = targetWidth;
                canvas.height = targetHeight;
                ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

                const base64Str = canvas.toDataURL('image/jpeg', 0.9);
                const metadata = JSON.stringify({ pos, zoom });
                resolve(`${base64Str}#meta=${encodeURIComponent(metadata)}`);
            };
        });
    };

    const getCroppedImage = () => {
         const source = tempCoverPhoto || formData.coverPhoto;
         return processImageWithMetadata(source, repositionPos, 1);
    };

    const getCroppedProfileImage = () => {
         const source = tempProfilePhoto || formData.profilePicture;
         return processImageWithMetadata(source, profileRepositionPos, profileZoom);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setIsLoading(true);


        const userId = user.id || user._id;


        if (!userId) {
            showError('Error: User ID not found. Please log in again.');
            setIsLoading(false);
            return;
        }

        // Username validation removed

        // Validate name has at least two words
        const nameWords = formData.name.trim().split(/\s+/).filter(w => w.length > 0);
        if (nameWords.length < 2) {
            showError('Please enter at least two words for your name (e.g. First Last).');
            setIsLoading(false);
            return;
        }

        // Validate email is provided
        if (!formData.email.trim()) {
            showError('Email address is required.');
            setIsLoading(false);
            return;
        }

        try {
            let finalCoverPhoto = formData.coverPhoto;
            if (tempCoverPhoto || formData.coverPhoto) {
                const cropped = await getCroppedImage();
                if (cropped) {
                    finalCoverPhoto = cropped;
                }
            }

            let finalProfilePhoto = formData.profilePicture;
            if (tempProfilePhoto || formData.profilePicture) {
                const croppedProfile = await getCroppedProfileImage();
                if (croppedProfile) {
                    finalProfilePhoto = croppedProfile;
                }
            }

            const response = await fetch(`${url}/api/auth/profile/update`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: userId,
                    ...formData,
                    coverPhoto: finalCoverPhoto,
                    profilePicture: finalProfilePhoto
                })
            });

            const data = await response.json();

            if (response.ok) {
                updateUser(data);
                setIsEditing(false);
                setIsRepositioning(false);
                setTempCoverPhoto(null);

                setIsRepositioningProfile(false);
                setTempProfilePhoto(null);
                setProfileZoom(1);

                // Update local state 
                setFormData(prev => ({
                    ...prev,
                    coverPhoto: finalCoverPhoto,
                    profilePicture: finalProfilePhoto
                }));
                showSuccess('Profile updated successfully!');
            } else {
                console.error("Module 1 Update Failed:", data);
                showError(data.error || 'Failed to update profile.');
            }
        } catch (err) {
            console.error("Module 1 Network Error:", err);
            showError('Server connection error.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        setFormData({
            username: user.username || '',
            name: user.name || '',
            email: user.email || '',
            designation: user.designation || '',
            department: user.department || '',
            phoneNumber: user.phoneNumber || '',
            profilePicture: user.profilePicture || '',
            coverPhoto: user.coverPhoto || '',
            bio: user.bio || ''
        });
        setIsEditing(false);
        setIsRepositioning(false);
        setTempCoverPhoto(null);
        setRepositionPos(initialCover.pos);

        setIsRepositioningProfile(false);
        setTempProfilePhoto(null);
        setProfileRepositionPos(initialProfile.pos);
        setProfileZoom(initialProfile.zoom);
    };

    return (
        <div className={`page profile-page ${isEditing ? 'profile-editing-layout' : ''}`}>


            <div className="profile-twitter-container">
                <div
                    ref={bannerRef}
                    className={`profile-cover-banner ${isRepositioning ? 'repositioning' : ''}`}
                    style={{
                        backgroundImage: (isRepositioning ? tempCoverPhoto : formData.coverPhoto)
                            ? `url(${extractPhotoData(isRepositioning ? tempCoverPhoto : formData.coverPhoto).url})`
                            : undefined,
                        backgroundSize: 'cover',
                        backgroundPosition: isRepositioning
                            ? `${repositionPos.x}% ${repositionPos.y}%`
                            : isEditing ? `${repositionPos.x}% ${repositionPos.y}%` : `${initialCover.pos.x}% ${initialCover.pos.y}%`,
                        backgroundRepeat: 'no-repeat',
                        cursor: isEditing ? 'move' : 'default'
                    }}
                    onMouseDown={(e) => isEditing && handleMouseDown(e)}
                    onMouseMove={(e) => isEditing && handleMouseMove(e)}
                    onMouseUp={() => isEditing && handleMouseUp()}
                    onMouseLeave={() => isEditing && handleMouseUp()}
                >
                    {!isRepositioning && <div className="profile-cover-gradient"></div>}

                    {isEditing && !isRepositioning && (
                        <>
                            {!formData.coverPhoto ? (
                                <label className="add-cover-photo-btn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                        <circle cx="12" cy="13" r="4"></circle>
                                    </svg>
                                    Add cover photo
                                    <input type="file" accept="image/*" onChange={handleCoverPhotoChange} style={{ display: 'none' }} />
                                </label>
                            ) : (
                                <div className="cover-photo-menu-container" ref={coverMenuRef}>
                                    <button
                                        className="profile-cover-edit-btn"
                                        onClick={() => setShowCoverMenu(!showCoverMenu)}
                                    >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                            <circle cx="12" cy="13" r="4"></circle>
                                        </svg>
                                        Edit cover photo
                                    </button>

                                    {showCoverMenu && (
                                        <div className="cover-photo-menu">

                                            <label className="cover-photo-menu-item">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                    <polyline points="17 8 12 3 7 8"></polyline>
                                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                                </svg>
                                                Upload photo
                                                <input type="file" accept="image/*" onChange={(e) => {
                                                    handleCoverPhotoChange(e);
                                                    setShowCoverMenu(false);
                                                }} style={{ display: 'none' }} />
                                            </label>

                                            <div className="cover-menu-separator"></div>
                                            <div className="cover-photo-menu-item" onClick={handleRemoveCoverPhoto}>
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="3 6 5 6 21 6"></polyline>
                                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                </svg>
                                                Remove
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {isRepositioning && (
                        <div className="reposition-controls">
                            <div className="reposition-text">Drag to adjust</div>
                        </div>
                    )}
                </div>

                <div className="profile-avatar-section">
                    <div className="profile-avatar-wrapper">
                        <div
                            className={`profile-large-avatar ${(isRepositioningProfile || isEditing) ? 'repositioning' : ''}`}
                            ref={profileImageRef}
                            onMouseDown={(e) => isEditing && handleProfileMouseDown(e)}
                            onMouseMove={(e) => isEditing && handleProfileMouseMove(e)}
                            onMouseUp={() => isEditing && handleProfileMouseUp()}
                            onMouseLeave={() => isEditing && handleProfileMouseUp()}
                            style={isEditing ? { cursor: 'move' } : {}}
                        >
                            {(isRepositioningProfile || (isEditing && formData.profilePicture) || formData.profilePicture) ? (
                                <img
                                    src={extractPhotoData(isRepositioningProfile ? tempProfilePhoto : formData.profilePicture).url}
                                    alt="Profile"
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover',
                                        objectPosition: `${(isRepositioningProfile || isEditing) ? profileRepositionPos.x : initialProfile.pos.x}% ${(isRepositioningProfile || isEditing) ? profileRepositionPos.y : initialProfile.pos.y}%`,
                                        transform: `scale(${(isRepositioningProfile || isEditing) ? profileZoom : initialProfile.zoom})`,
                                        pointerEvents: 'none',
                                        userSelect: 'none'
                                    }}
                                />
                            ) : (
                                getInitials(formData.name || user.email) || user.email?.charAt(0).toUpperCase() || 'U'
                            )}

                            {isEditing && !isRepositioningProfile && (
                                <div className="profile-photo-edit-wrapper" ref={profilePhotoMenuRef}>
                                    <div
                                        className="image-upload-overlay"
                                        onClick={() => setShowProfilePhotoMenu(!showProfilePhotoMenu)}
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                            <circle cx="12" cy="13" r="4"></circle>
                                        </svg>
                                    </div>

                                    {showProfilePhotoMenu && (
                                        <div className="cover-photo-menu profile-photo-menu">
                                            <label className="cover-photo-menu-item">
                                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                                    <polyline points="17 8 12 3 7 8"></polyline>
                                                    <line x1="12" y1="3" x2="12" y2="15"></line>
                                                </svg>
                                                Upload photo
                                                <input type="file" accept="image/*" onChange={(e) => {
                                                    handleImageChange(e);
                                                    setShowProfilePhotoMenu(false);
                                                }} style={{ display: 'none' }} />
                                            </label>

                                            {formData.profilePicture && (
                                                <>
                                                    <div className="cover-menu-separator"></div>
                                                    <div className="cover-photo-menu-item" onClick={handleRemoveProfilePhoto}>
                                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                            <polyline points="3 6 5 6 21 6"></polyline>
                                                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                                        </svg>
                                                        Remove
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}


                        </div>
                    </div>

                    <div className="profile-header-actions">
                        {!isEditing && (
                            <button className="profile-edit-btn" onClick={() => setIsEditing(true)}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                                </svg>
                                Edit profile
                            </button>
                        )}
                    </div>
                </div>

                <div className="profile-identity-info">
                    <h1 className="profile-display-name">
                        {user.name || user.email?.split('@')[0] || 'User'}
                        {((isEditing ? formData.phoneNumber : user.phoneNumber)?.length === 10) && (
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginLeft: '6px', verticalAlign: 'middle' }}>
                                <path fillRule="evenodd" clipRule="evenodd" d="M12.2356 1.70113C11.5833 0.816091 10.2751 0.816091 9.62283 1.70113L8.68067 2.98068C8.34997 3.42939 7.7951 3.65992 7.2343 3.5828L5.65582 3.36605C4.55836 3.21495 3.53503 3.96207 3.37682 5.0601L3.14923 6.63842C3.06847 7.19894 2.8028 7.71261 2.3985 8.09353L1.26125 9.16738C0.470477 9.91421 0.470477 11.218 1.26125 11.9648L2.3985 13.0387C2.8028 13.4196 3.06847 13.9333 3.14923 14.4938L3.37682 16.0721C3.53503 17.1701 4.55836 17.9173 5.65582 17.7661L7.2343 17.5494C7.7951 17.4723 8.34997 17.7028 8.68067 18.1515L9.62283 19.4311C10.2751 20.3161 11.5833 20.3161 12.2356 19.4311L13.1778 18.1515C13.5085 17.7028 14.0633 17.4723 14.6241 17.5494L16.2026 17.7661C17.3001 17.9173 18.3234 17.1701 18.4816 16.0721L18.7092 14.4938C18.7899 13.9333 19.0556 13.4196 19.4599 13.0387L20.5972 11.9648C21.3879 11.218 21.3879 9.91421 20.5972 9.16738L19.4599 8.09353C19.0556 7.71261 18.7899 7.19894 18.7092 6.63842L18.4816 5.0601C18.3234 3.96207 17.3001 3.21495 16.2026 3.36605L14.6241 3.5828C14.0633 3.65992 13.5085 3.42939 13.1778 2.98068L12.2356 1.70113Z" fill="#1877F2" />
                                <path d="M15.932 8.17415C16.3533 7.79462 16.3888 7.14371 16.0108 6.72123C15.6328 6.29875 14.9845 6.26325 14.5632 6.64277L9.85175 10.8872L7.36214 8.44199C6.97495 8.06173 6.34976 8.06173 5.96541 8.44773C5.58107 8.83118 5.58362 9.45036 5.97081 9.83062L9.123 12.9255C9.31016 13.1093 9.56306 13.208 9.82479 13.1994C10.0865 13.1908 10.3341 13.0757 10.5117 12.8804L15.932 8.17415Z" fill="white" />
                            </svg>
                        )}
                    </h1>
                    <div className="profile-handle-row" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap', marginTop: '0.15rem' }}>
                        {(user.username && !user.username.includes('@')) && (
                            <span className="profile-username-handle" style={{
                                fontWeight: 600,
                                color: 'var(--accentColor)',
                                fontSize: '1.2rem',
                                letterSpacing: '0.01em'
                            }}>{user.username}</span>
                        )}
                    </div>
                    {isEditing ? (
                        <div className="profile-bio-editor">
                            <textarea
                                ref={bioInputRef}
                                className="profile-bio-input"
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                placeholder="Write something about yourself..."
                                maxLength={150} // Limit to 150 characters
                                rows={1}
                                style={{
                                    marginTop: '1.2rem',
                                    marginBottom: '0',
                                    paddingTop: '0.4rem',
                                    paddingBottom: '1rem', // Further reduced padding for counter
                                    height: 'auto',
                                    minHeight: '2.5rem'
                                }}
                            />
                            <div style={{
                                position: 'absolute',
                                bottom: '5px',
                                right: '10px',
                                fontSize: '0.75rem',
                                color: '#999',
                                pointerEvents: 'none'
                            }}>
                                {formData.bio.length}/150
                            </div>
                        </div>
                    ) : (
                        <div className="profile-bio-display">
                            {formData.bio ? (
                                <p className="profile-bio-text">{renderBioWithLinks(formData.bio)}</p>
                            ) : (
                                <span
                                    className="profile-add-bio"
                                    onClick={() => {
                                        setIsEditing(true);
                                        setTimeout(() => {
                                            bioInputRef.current?.focus();
                                        }, 100);
                                    }}
                                >
                                    Add Bio
                                </span>
                            )}
                        </div>
                    )}
                    <div className="profile-professional-info">
                        {(user.designation || user.department) ? (
                            <>
                                {user.designation && (
                                    <span className="profile-info-item">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                                            <path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"></path>
                                            <path d="M12 12v.01"></path>
                                            <path d="M2 12h20"></path>
                                        </svg>
                                        {user.designation}
                                    </span>
                                )}
                                {user.department && (
                                    <span className="profile-info-item">
                                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                                            <path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5"></path>
                                        </svg>
                                        {user.department}
                                    </span>
                                )}
                            </>
                        ) : (
                            <span className="profile-info-placeholder" onClick={() => {
                                setIsEditing(true);
                                setTimeout(() => {
                                    designationInputRef.current?.focus();
                                }, 100);
                            }}>
                                + Add Professional Details
                            </span>
                        )}
                    </div>
                </div>


            </div>

            {isEditing && (
                <div className="profile-details-card">
                    <div className="profile-details-header">
                        <h3>Account Details</h3>
                        {isEditing && (
                            <div className="badge primary">Editing Mode</div>
                        )}
                    </div>

                    <form onSubmit={handleSave} className="profile-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label>Name <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="Your full name"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Designation</label>
                                <input
                                    ref={designationInputRef}
                                    type="text"
                                    name="designation"
                                    value={formData.designation}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="e.g. Associate Professor"
                                />
                            </div>
                            <div className="form-group">
                                <label>Department</label>
                                <input
                                    type="text"
                                    name="department"
                                    value={formData.department}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="e.g. Information Science"
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Phone Number</label>
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="Phone"
                                    maxLength={10}
                                />
                            </div>
                            <div className="form-group">
                                <label>Email Address <span style={{ color: 'red' }}>*</span></label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    disabled={!isEditing}
                                    placeholder="your@email.com"
                                />
                                {isEditing && formData.email !== user.email && (
                                    <span className="profile-email-change-note">
                                        ✉ Email will be updated after saving
                                    </span>
                                )}
                            </div>
                        </div>

                        {isEditing && (
                            <div className="form-actions" style={{
                                display: 'flex',
                                gap: '1rem',
                                marginTop: '2rem',
                                paddingTop: '1.5rem',
                                borderTop: '1px solid var(--borderColor)'
                            }}>
                                <button type="button" className="btn secondary" onClick={handleCancel} disabled={isLoading} style={{ flex: 1 }}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn primary" disabled={isLoading} style={{ flex: 2 }}>
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            )}
        </div>
    );
};

export default ProfilePage;
