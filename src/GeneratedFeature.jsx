### Code for: New Enquiry Form

This code provides a basic HTML structure for a new enquiry form and a JavaScript snippet to handle form submission and display a success message. It also includes example CSS styling.  This example uses a basic form setup; in a real-world application, you'd likely use a backend language and database for processing and storing the form data.

```html
<!DOCTYPE html>
<html>
<head>
<title>Enquiry Form</title>
<style>
  /* Basic Styling */
  #enquiry-form {
    width: 300px;
    margin: 0 auto;
    padding: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
  label {
    display: block;
    margin-bottom: 5px;
  }
  input[type="text"],
  input[type="email"],
  textarea {
    width: 100%;
    padding: 8px;
    margin-bottom: 10px;
    box-sizing: border-box; /* Include padding and border in element's total width and height */
  }
  button {
    background-color: #4CAF50;
    color: white;
    padding: 10px 15px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
  }
  .success-message {
    color: green;
    margin-top: 10px;
  }
</style>
</head>
<body>

<div id="enquiry-form">
  <h2>Enquiry Form</h2>
  <form id="myForm" onsubmit="submitForm(event)">
    <label for="name">Name:</label>
    <input type="text" id="name" name="name" required><br><br>

    <label for="email">Email:</label>
    <input type="email" id="email" name="email" required><br><br>

    <label for="message">Enquiry:</label>
    <textarea id="message" name="message" rows="4" required></textarea><br><br>

    <button type="submit">Submit</button>
  </form>
  <div id="success" class="success-message" style="display:none;">Thank you for your enquiry! We will get back to you soon.</div>
</div>

<script>
function submitForm(event) {
  event.preventDefault(); // Prevent form from actually submitting 
  document.getElementById("success").style.display = "block";
  document.getElementById("myForm").reset(); // Clear the form fields

  // In a real application, you would send the form data to the server here using AJAX or Fetch API
}

</script>

</body>
</html>
```
```python
#  This would be server-side code (example in Python using Flask)
#  This is a very basic example; adapt for your specific backend setup.

from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/', methods=['GET', 'POST'])
def enquiry_form():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        message = request.form.get('message')
        # Process the form data (e.g., save to database, send email)
        return "Thank you for your enquiry!" # Or render a thank you page
    return render_template('enquiry_form.html') # enquiry_form.html would contain the HTML above


if __name__ == '__main__':
    app.run(debug=True)


```