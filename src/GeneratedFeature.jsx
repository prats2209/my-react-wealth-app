### Code for: Jira User Story: New Enquiry Link on Login Page

This code demonstrates a simplified implementation of the Jira story, focusing on the front-end (HTML) and a basic form submission mechanism.  A robust solution would involve server-side processing and integration with a CRM or other backend system.

```html
<!DOCTYPE html>
<html>
<head>
    <title>Login</title>
    <style>
        #enquiry-link {
            margin-top: 20px; /* Space between login form and enquiry link */
            display: block;  /* Ensure the link is on its own line */
        }
    </style>
</head>
<body>

    <h1>Login</h1>

    <form id="loginForm" action="/login" method="post"> 
        <label for="username">Username:</label>
        <input type="text" id="username" name="username"><br><br>
        <label for="password">Password:</label>
        <input type="password" id="password" name="password"><br><br>
        <input type="submit" value="Login">
    </form>


    <a id="enquiry-link" href="/enquiry">Enquiry</a>


    <h2>Enquiry Form</h2> <div style="display: none" id="enquiryFormContainer"> </div>
    <script>
    document.getElementById('enquiry-link').addEventListener('click', function(event) {
        // Prevent default link behavior (page navigation)
        event.preventDefault(); 
        // Use AJAX or fetch to dynamically load form content
        fetch('/enquiry')  // Replace with your actual enquiry form URL
            .then(response => response.text())
            .then(data => {
                document.getElementById('enquiryFormContainer').innerHTML = data;
                document.getElementById('enquiryFormContainer').style.display = 'block';
            })
            .catch(error => console.error('Error loading enquiry form:', error));
    });
    </script>
</body>
</html>
```

```python
#  Example server-side (Python/Flask) for handling the enquiry form submission.
from flask import Flask, render_template, request

app = Flask(__name__)

@app.route('/login', methods=['POST'])
def login():
  # Handle login logic here (e.g., user authentication)
  pass


@app.route('/enquiry', methods=['GET', 'POST'])
def enquiry():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        message = request.form.get('message')
        # Process enquiry data (e.g., send email, save to database/CRM)
        print(f"Enquiry received:\nName: {name}\nEmail: {email}\nMessage: {message}")
        return "Thank you for your enquiry!"
    else: #GET
        return render_template('enquiry_form.html') # render enquiry form.


#  enquiry_form.html (template file)
#  <form method="post">
#      <label for="name">Name:</label><input type="text" id="name" name="name"><br>
#      <label for="email">Email:</label><input type="email" id="email" name="email"><br>
#      <label for="message">Message:</label><textarea id="message" name="message"></textarea><br>
#      <button type="submit">Submit</button>
#  </form>

if __name__ == '__main__':
    app.run(debug=True) 
```
