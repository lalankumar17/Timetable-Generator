import { url } from "./fetchUrl"

export const getSubjectsDetailsList = async (onSuccess = () => { }) => {
    try {
        const response = await fetch(`${url}/io/subjects`);
        if (response.status === 200) {
            let listArray = [];
            try {
                listArray = await response.json();
            } catch {
                console.error("Subjects data is invalid:", await response.text());
            }
            onSuccess(listArray);
            return listArray;
        } else {
            console.error("Error fetching subjects details:", await response.text());
            return [];
        }
    } catch (error) {
        console.error("Unable to fetch subjects data");
        throw error;
    }
}

// Save new subject
export const saveSubject = async (subjectDetails, onSuccess, onFailed) => {
    try {
        const subjectName = subjectDetails.name;
        // The backend expects PUT at /io/subjects/{name} with body
        const response = await fetch(`${url}/io/subjects/${encodeURIComponent(subjectName)}`, {
            method: "PUT",
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(subjectDetails)
        });

        if (response.status === 200 || response.status === 201) {
            onSuccess();
            return subjectName;
        } else {
            const textResponse = await response.text();
            console.error("Error saving subject details:", textResponse);
            onFailed(textResponse || "Server returned " + response.status);
            return null;
        }
    } catch (error) {
        console.error("Invalid subject data or unable to send request:", error);
        onFailed(error.message || "Network or Server Error");
        throw error;
    }
}
