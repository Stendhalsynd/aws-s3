const aws = require("aws-sdk"); // aws 설정을 위한 모듈
const multerS3 = require("multer-s3"); // aws s3 에 업로드하기 위한 multer 설정
const express = require("express");
const multer = require("multer");
const dotenv = require("dotenv");
dotenv.config();
const app = express();
const PORT = 8000;

// view engine 설정
app.set("view engine", "ejs");
// multer static 설정
app.use("/uploads", express.static(__dirname + "/uploads"));

const { S3_KEY_ID, S3_ACCESS_KEY, S3_REGION, S3_BUCKET } = process.env;

// aws 설정
aws.config.update({
  accessKeyId: S3_KEY_ID,
  secretAccessKey: S3_ACCESS_KEY,
  region: S3_REGION,
});

// aws s3 인스턴스 생성
const s3 = new aws.S3(); // 버킷

// multer 설정 - aws
const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: S3_BUCKET,
    acl: "public-read", // 파일 접근 권한 (public-read 로 해야 업로드된 파일 공개)
    metadata: function (req, file, cb) {
      cb(null, { fieldName: file.fieldName });
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString() + "-" + file.originalname);
    },
  }),
});

// router
app.get("/", (req, res) => {
  res.render("index");
});

app.post("/upload", upload.array("files"), (req, res) => {
  console.log(req.files);
  res.send(req.files);
});

// listen
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
