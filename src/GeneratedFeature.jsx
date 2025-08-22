### Code for: Jira User Story: Contact Us Link on Login Page

This code demonstrates adding a "Contact Us" link to a simple HTML login page. It fulfills the acceptance criteria by placing a visible link on the page. This example assumes a basic HTML structure; adapt as needed for your specific login page implementation.

```html
<!DOCTYPE html>
<html>
<head>
  <title>Login</title>
</head>
<body>

  <h1>Login</h1>

  <form>
    <label for="username">Username:</label><br>
    <input type="text" id="username" name="username"><br><br>

    <label for="password">Password:</label><br>
    <input type="password" id="password" name="password"><br><br>

    <input type="submit" value="Submit">
  </form> 

  <br>
  <a href="contact.html">Contact Us</a> <br>
  <a href="contact.html">Contact Us</a>

</body>
</html>
```
