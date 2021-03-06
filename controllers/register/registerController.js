const express = require("express");
const router = express.Router();
const axios = require("axios");
const { db, admin, auth } = require("../../config/firebaseConfig");

router.post("/", (req, res) => {
  const { firstName, lastName, userName, email, password } = req.body;
  const authData = {
    email: email,
    password: password
  };

  res.setHeader("Access-Control-Allow-Origin", "*");

  db.collection("users")
    .where("username", "==", userName)
    .get()
    .then(docs => {
      if (docs.size >= 1) {
        res.json({
          usernameTaken: true
        });
      } else {
        axios
          .post(
            "https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyAaJRfgtMU3LqvV07NyiaGfqUj_XGpkoNo",
            authData
          )
          .then(response => {
            db.collection("users")
              .doc(response.data.localId)
              .set({
                firstName: firstName,
                lastName: lastName,
                username: userName,
                userData: firstName + " " + lastName,
                rule: "client"
              })
              .then(() => {
                axios({
                  method: "post",
                  url:
                    "https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=AIzaSyAaJRfgtMU3LqvV07NyiaGfqUj_XGpkoNo",
                  headers: {},
                  data: {
                    requestType: "VERIFY_EMAIL",
                    idToken: response.data.idToken
                  }
                }).then(() => {
                  res.json({
                    isRegistered: true
                  });
                });
              })

              .catch(err => {
                res.json({
                  error: "error write to database"
                });
              });
          })
          .catch(err => {
            res.json({
              emailTaken: true
            });
          });
      }
    })
    .catch(err => {
      res.json({
        error: "error read username from database"
      });
    });
});
module.exports = router;
