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
    });
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
    });
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
    });
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
    });
}

// Log changes to Firebase (when bucket data changes)
function logBucketChange(bucketId, action, companyData) {
    db.collection("bucketChanges").add({
        bucketId: bucketId,
        action: action,
        companyData: companyData,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
    });
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
    });
}

// Function to track the top common companies across all buckets
function updateCommonCompanies() {
    db.collection("buckets").get().then((snapshot) => {
        let companyCount = {};

        snapshot.forEach((doc) => {
            db.collection("buckets").doc(doc.id).collection("companies").get().then((companySnapshot) => {
                companySnapshot.forEach((companyDoc) => {
                    const company = companyDoc.data();
                    const companyKey = `${company.name} (${company.nseCode})`;
                    companyCount[companyKey] = (companyCount[companyKey] || 0) + 1;
                });
                displayTopCommonCompanies(companyCount);
            });
        });
    });
}

// Display the top 30 common companies
function displayTopCommonCompanies(companyCount) {
    let sortedCompanies = Object.entries(companyCount).sort((a, b) => b[1] - a[1]);
    let topCompanies = sortedCompanies.slice(0, 30);
    let companyRows = "";
    topCompanies.forEach((company) => {
        companyRows += `<tr>
            <td>${company[0]}</td>
            <td>${company[1]}</td>
        </tr>`;
    });
    document.getElementById("common-companies-list").innerHTML = companyRows;
}

// Load data when the page is loaded
window.onload = function() {
    fetchCompanies();
    fetchBuckets();
    displayChanges();
    updateCommonCompanies();
};
