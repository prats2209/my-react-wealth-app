### Code for: New Contact Us Form

This code provides a basic HTML structure for a "Contact Us" form, along with CSS for styling and JavaScript for basic form validation.  It also includes example integration with a hypothetical backend API for form submission.  This is a simplified example and would need to be adapted to a specific website's framework and backend.

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Contact Us</title>
  <style>
    /* Basic styling for the form */
    form {
      width: 500px;
      margin: 0 auto;
      padding: 20px;
      border: 1px solid #ccc;
    }
    label {
      display: block;
      margin-bottom: 5px;
    }
    input, textarea {
      width: 100%;
      padding: 8px;
      margin-bottom: 10px;
      box-sizing: border-box;
    }
    button {
      padding: 10px 20px;
      background-color: #4CAF50;
      color: white;
      border: none;
      cursor: pointer;
    }
  </style>
</head>
<body>

  <nav>
    <a href="#">Home</a>
    <a href="#">About</a>
    <a href="#">Contact Us</a>
  </nav>

  <footer>
    <a href="#">Contact Us</a>
  </footer>


  <h1>Contact Us</h1>
  <form id="contact-form">
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required>

    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required>

    <label for="message">Message:</label>
    <textarea id="message" name="message" rows="5" required></textarea>

    <button type="submit">Submit</button>
  </form>

  <script>
    const form = document.getElementById('contact-form');

    form.addEventListener('submit', (event) => {
      event.preventDefault(); // Prevent default form submission

      // Basic client-side validation
      if (!form.checkValidity()) {
        alert('Please fill in all required fields.');
        return;
      }

      const formData = new FormData(form);

      // Example API submission (replace with your actual API endpoint)
      fetch('/api/contact', {
        method: 'POST',
        body: formData
      })
      .then(response => {
        if (response.ok) {
          alert('Your message has been sent!');
          form.reset();
        } else {
          alert('There was an error submitting your message.');
        }
      });
    });
  </script>

</body>
</html>
```
