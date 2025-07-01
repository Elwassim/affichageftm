// Script pour réinitialiser les données localStorage
if (typeof localStorage !== "undefined") {
  localStorage.removeItem("union-dashboard-data");
  console.log("localStorage cleared successfully");
} else {
  console.log("localStorage not available");
}
