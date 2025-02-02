// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-firestore.js";

// Your Firebase Config
const firebaseConfig = {
    apiKey: "AIzaSyDJ45GasB32NOx2sqH1Hrt26eTgUvTKzAQ",
    authDomain: "project-1-15aa1.firebaseapp.com",
    projectId: "project-1-15aa1",
    storageBucket: "project-1-15aa1.firebasestorage.app",
    messagingSenderId: "515442479036",
    appId: "1:515442479036:web:181ba2a7bdab2919a4a5b9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Function to add a company
window.addCompany = async function () {
    let name = document.getElementById("companyName").value;
    let code = document.getElementById("nseCode").value;

    if (name && code) {
        try {
            await addDoc(collection(db, "companies"), { name, code });
            alert("Company Added!");
            loadCompanies();
        } catch (error) {
            console.error("Error adding company:", error);
        }
    }
};

// Function to load companies into Tabulator table
async function loadCompanies() {
    const querySnapshot = await getDocs(collection(db, "companies"));
    let companies = [];
    querySnapshot.forEach(doc => {
        companies.push({ id: doc.id, ...doc.data() });
    });

    new Tabulator("#companies-table", {
        data: companies,
        layout: "fitColumns",
        columns: [
            { title: "Company Name", field: "name" },
            { title: "NSE Code", field: "code" }
        ]
    });
}

// Load companies when the page loads
window.onload = loadCompanies;
// Function to log changes to the Firebase Firestore (when bucket data changes)
function logBucketChange(bucketId, action, companyData) {
   const db = firebase.firestore();
   db.collection("bucketChanges").add({
     bucketId: bucketId,
     action: action,
     companyData: companyData,
     timestamp: firebase.firestore.FieldValue.serverTimestamp()
   });
}

// Display recent changes in the dashboard
function displayChanges() {
   const db = firebase.firestore();
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
   const db = firebase.firestore();
   db.collection("buckets").get().then((snapshot) => {
     let companyCount = {};

     snapshot.forEach((doc) => {
       const bucket = doc.data();
       db.collection("buckets").doc(doc.id).collection("companies").get().then((companySnapshot) => {
         companySnapshot.forEach((companyDoc) => {
           const company = companyDoc.data();
           const companyKey = company.name + " (" + company.nseCode + ")";
           if (companyCount[companyKey]) {
             companyCount[companyKey]++;
           } else {
             companyCount[companyKey] = 1;
           }
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
   displayChanges();  // Load recent changes
   updateCommonCompanies();  // Load top 30 common companies
};
