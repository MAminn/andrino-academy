// Test registration API
const testData = {
  name: "أحمد محمد",
  email: "ahmed@test.com",
  password: "123456",
  age: 12,
  parentName: "محمد أحمد",
  parentEmail: "parent@test.com",
  parentPhone: "+966501234567",
  priorExperience: "basic",
};

fetch("http://localhost:3000/api/auth/register", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(testData),
})
  .then((response) => response.json())
  .then((data) => {
    console.log("Response:", data);
  })
  .catch((error) => {
    console.error("Error:", error);
  });

console.log("Test data being sent:", testData);
