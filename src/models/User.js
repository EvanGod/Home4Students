class User {
    constructor(username, email, password, phone, address, role, fullName, createdAt) {
      this.username = username;
      this.email = email;
      this.password = password;
      this.phone = phone;
      this.address = address;
      this.role = role;
      this.fullName = fullName;
      this.createdAt = createdAt || new Date();
    }
  }
  
module.exports = User;
  