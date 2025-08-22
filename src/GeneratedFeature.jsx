### Code for: Jira User Story: Contact Us Button

This code provides a basic implementation of a "Contact Us" button using JavaScript and HTML. It checks the current URL to exclude specific landing pages and dynamically adds the button to the page.

```javascript
// Function to check if the current page is a landing page
function isLandingPage() {
  const landingPageURLs = [
    "/landing-page-1",
    "/promotions/special-offer",
    // Add other landing page URLs here
  ];
  const currentURL = window.location.pathname;
  return landingPageURLs.some(landingPageURL => currentURL.includes(landingPageURL));
}

// Function to add the "Contact Us" button
function addContactUsButton() {
  if (!isLandingPage()) {
    const button = document.createElement("button");
    button.textContent = "Contact Us";
    button.id = "contact-us-button"; // Add an ID for styling and further functionality

    // Add styling (you can customize this)
    button.style.position = "fixed";
    button.style.bottom = "20px";
    button.style.right = "20px";
    button.style.padding = "10px 20px";
    button.style.backgroundColor = "#007bff"; // Example: Bootstrap blue
    button.style.color = "white";
    button.style.border = "none";
    button.style.borderRadius = "5px";
    button.style.cursor = "pointer";
    button.style.zIndex = "1000"; // Ensure it's on top


    // You can add an event listener here to handle clicks (e.g., open a contact form, redirect to a contact page, etc.)
    button.addEventListener("click", () => {
        // Example: Open a new window/tab to your contact page
        window.open("/contact", "_blank"); 
    });

    document.body.appendChild(button);
  }
}



// Call the function to add the button when the DOM is fully loaded.
// Using DOMContentLoaded ensures that the button is added after the rest of the page elements are loaded.
document.addEventListener('DOMContentLoaded', addContactUsButton);


```

```html
<!-- Example of how to include the JavaScript code in your HTML file -->
<!DOCTYPE html>
<html>
<head>
  <title>Your Website</title>
  <script src="your-script.js" defer></script> </head>
<body>
  </body>
</html>

```
