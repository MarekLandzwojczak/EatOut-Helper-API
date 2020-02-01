const express = require("express");
const router = express.Router();
const redis = require("redis");
const redisClient = redis.createClient();
const { db, admin, auth } = require("../../config/firebaseConfig");
const deleteImg = require("./deleteImg");
const getPlace = require("../../getAll/getPlace");
const getOpinion = require("../../getAll/getClientOpinon");
const getPostsOwner = require("../../getAll/getPostsOwner");

router.post("/", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");

  console.log("Remove place", req.body);
  const z = req.body.z;
  const id = req.body.id;

  const key = "sess:" + z;

  redisClient.get(key, (err, red) => {
    red = JSON.parse(red);
    console.log("LokalId w redisie", red.localId);
    db.collection("eatingPlaces")
      .doc(id)
      .get()
      .then(doc => {
        if (red.localId === doc.data().info.owner) {
          db.collection("eatingPlaces")
            .doc(id)
            .delete()
            .then(async () => {
              await deleteImg("avatar.jpg", red.localId, id);
              await deleteImg("header.jpg", red.localId, id);
              await deleteImg("menu.jpg", red.localId, id);

              const Place = await getPlace(red.localId);
              if(Place != null){
              const Opinion = await getOpinion(Place);
              const Posts = await getPostsOwner(Opinion);
              res.json({
                ownerPlaces: Posts,
                removePlace: true
              });
              }
              else{

              res.json({
                ownerPlaces: null,
                removePlace: true
              });
            }
            });
        } else {
          res.json({
            removePlace: false,
            message: "You are not the onwer of this place"
          });
        }
      });
  });
});

module.exports = router;