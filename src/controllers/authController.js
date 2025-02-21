const { db } = require("../config/firebase");
const { encryptPassword, comparePassword } = require("../utils/encrypt");
const jwt = require("jsonwebtoken");

const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

const phoneRegex = /^\d{10}$/;

exports.register = async (req, res) => {
  const { username, email, password, phone, address, role, fullName } = req.body;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: "El formato del email es incorrecto" });
  }

  if (!password || !passwordRegex.test(password)) {
    return res.status(400).json({
      message: "La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número",
    });
  }

  if (!phone || !phoneRegex.test(phone)) {
    return res.status(400).json({ message: "El teléfono debe tener 10 dígitos y solo números" });
  }

  if (!username || !address || !role || !fullName) {
    return res.status(400).json({ message: "Todos los campos son obligatorios" });
  }

  try {
    const emailRef = db.collection("users").where("email", "==", email);
    const emailSnapshot = await emailRef.get();
    if (!emailSnapshot.empty) {
      return res.status(400).json({ message: "El email ya está en uso" });
    }

    const usernameRef = db.collection("users").where("username", "==", username);
    const usernameSnapshot = await usernameRef.get();
    if (!usernameSnapshot.empty) {
      return res.status(400).json({ message: "El nombre de usuario ya está en uso" });
    }

    const phoneRef = db.collection("users").where("phone", "==", phone);
    const phoneSnapshot = await phoneRef.get();
    if (!phoneSnapshot.empty) {
      return res.status(400).json({ message: "El teléfono ya está registrado" });
    }

    const hashedPassword = await encryptPassword(password);
    const newUser = {
      username,
      email,
      password: hashedPassword,
      phone,
      address,
      role,
      fullName,
    };

    const userRef = db.collection("users").doc(email);
    await userRef.set(newUser);

    res.status(201).json({ message: "Usuario registrado correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !emailRegex.test(email)) {
    return res.status(400).json({ message: "El formato del email es incorrecto" });
  }

  if (!password) {
    return res.status(400).json({ message: "Se requiere la contraseña" });
  }

  try {
    const userRef = db.collection("users").doc(email);
    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }

    const userData = doc.data();
    const isMatch = await comparePassword(password, userData.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Credenciales incorrectas" });
    }

    const token = jwt.sign({ id: doc.id, role: userData.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    console.log(token);
    res.json({ token, user: { username: userData.username, role: userData.role } });
  } catch (error) {
    res.status(500).json({ message: "Error en el servidor" });
  }
};
