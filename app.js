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
