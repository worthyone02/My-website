// Firebase Configuration
const firebaseConfig = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
    projectId: "YOUR_PROJECT_ID",
    storageBucket: "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Add a new company to Firestore
document.getElementById("company-form").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const companyName = document.getElementById("company-name").value;
    const companyNSECode = document.getElementById("company-nse-code").value;
    
    db.collection("companies").add({
        name: companyName,
        nseCode: companyNSECode
    }).then(() => {
        fetchCompanies(); // Refresh the list of companies
        document.getElementById("company-name").value = "";
        document.getElementById("company-nse-code").value = "";
    }).catch(error => console.log("Error adding company:", error));
});

// Add a new bucket to Firestore
document.getElementById("bucket-form").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const bucketName = document.getElementById("bucket-name").value;
    
    db.collection("buckets").add({
        name: bucketName
    }).then(() => {
        fetchBuckets(); // Refresh the list of buckets
        document.getElementById("bucket-name").value = "";
    }).catch(error => console.log("Error adding bucket:", error));
});

// Fetch and display companies
function fetchCompanies() {
    db.collection("companies").get().then((snapshot) => {
        let companiesList = "";
        snapshot.forEach((doc) => {
            const company = doc.data();
            companiesList += `<li>${company.name} (${company.nseCode})</li>`;
        });
        document.getElementById("companies-list").innerHTML = companiesList;
    }).catch(error => console.log("Error fetching companies:", error));
}

// Fetch and display buckets
function fetchBuckets() {
    db.collection("buckets").get().then((snapshot) => {
        let bucketsList = "";
        snapshot.forEach((doc) => {
            const bucket = doc.data();
            bucketsList += `<li>${bucket.name}</li>`;
        });
        document.getElementById("buckets-list").innerHTML = bucketsList;
    }).catch(error => console.log("Error fetching buckets:", error));
}

// Log changes to Firebase (when bucket data changes)
function logBucketChange(bucketId, action, companyData) {
    db.collection("bucketChanges").add({
        bucketId: bucketId,
        action: action,
        companyData: companyData,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    }).catch(error => console.log("Error logging bucket change:", error));
}

// Display recent changes in the dashboard
function displayChanges() {
    db.collection("bucketChanges").orderBy("timestamp", "desc").limit(5).get().then((snapshot) => {
        let changeLogs = "";
        snapshot.forEach((doc) => {
            const change = doc.data();
            changeLogs += `<tr>
                <td>${change.bucketId}</td>
                <td>${change.action}</td>
                <td>${JSON.stringify(change.companyData)}</td>
                <td>${new Date(change.timestamp.seconds * 1000).toLocaleString()}</td>
            </tr>`;
        });
        document.getElementById("change-log").innerHTML = changeLogs;
    }).catch(error => console.log("Error fetching changes:", error));
}

// Function to track the top common companies across all buckets
function updateCommonCompanies() {
    db.collection("buckets").get().then((snapshot) => {
        let companyCount = {};

        snapshot.forEach((doc) => {
            db.collection("buckets").doc(doc.id).collection("companies").get().then((companySnapshot) => {
