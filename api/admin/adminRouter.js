const router = require("express").Router();
const jwt = require("jsonwebtoken");
const story = require("../story/storyModel.js");
const admin = require("./adminModel.js");
const auth = require("../email/emailModel");
const s3 = require("../../services/file-upload");
const jwtSecret = process.env.JWT_SECRET || "sfwefsd9fdsf9sf9sf9sd8f9sdkfjkwekl23";
const adminRestricted = require("../middleware/adminRestricted");

router.get("/", adminRestricted, async (req, res) => 
{
    const submissions = await admin.getSubmissions();
    // Console.log(submissions)
    return res.json({ submissions });
});

router.get("/users", adminRestricted, async (req, res) => 
{
    const users = await admin.getUsers();
    if (users) 
    {
        return res.status(200).json({ users });
    }
    else 
    {
        return res.status(400).json({ error: "Something went wrong." });
    }
});

router.post("/video", adminRestricted, async (req, res) => 
{

    function youtube_parser(url)
    {
        const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[7].length == 11) ? match[7] : false;
    }

    if (req.body.link) 
    {
        const video_time = Date.parse(new Date());
        const sendPackage = {
            video_link: req.body.link,
            video_time: video_time,
            video_id: youtube_parser(req.body.link)
        };
        console.log(sendPackage);
        const addVideo = await admin.addVideo(sendPackage);
        if (addVideo) 
        {
            return res.status(200).json({ message: "Video added." });
        }
        else 
        {
            return res.status(400).json({ error: "Something went wrong adding video." });
        }
    }
    else 
    {
        return res.status(400).json({ error: "This request must include a valid YouTube link." });
    }
});

router.get("/flag/:id", adminRestricted, async (req, res) => 
{
    const flag = await admin.getFlag(req.params.id);
    if (flag) 
    {
        return res.status(200).json({ flag });
    }
    else 
    {
        return res.status(500).json({ error: "Something went wrong." });
    }
});

router.post("/flag/:id", adminRestricted, async (req, res) => 
{

    const flagged = await admin.flagContent(req.params.id);
    console.log("flagged", flagged);
    if (flagged) 
    {
        console.log(flagged);
        return res.status(200).json({ message: "Content flagged.", flag: 1 });
    }
    else 
    {
        return res.status(200).json({ message: "Content unflagged.", flag: 0 });
    }
});

router.get("/winners", adminRestricted, async (req, res) => 
{
    const subs = await admin.getSubmissionsPerTime();
    return res.json({ subs });
});

router.get("/image/:id", adminRestricted, async (req, res) =>
{
    let ID = req.params.id;

    if (!ID)
        return res.status(400).json({ error: "Invalid request paramaters" });

    ID = parseInt(ID);

    //Get the name of the image
    let URL = await admin.getSubmissionURLById(ID);

    if (!URL)
        return res.status(404).json({ error: "Submission not found in DB" });

    s3.getObject(
        {
            Bucket: "storysquad",
            Key: URL
        })
        .on("httpHeaders", function (statusCode, headers) 
        {
            res.set("Content-Length", headers["content-length"]);
            res.set("Content-Type", headers["content-type"]);
            res.set("Cache-control", "private, max-age=86400");
            this.response.httpResponse.createUnbufferedStream().pipe(res);
            res.status(statusCode);
        }).on("error", function (err)
        {
            console.log(err);
        }).send();
});

router.post("/remove_user_data/:email", adminRestricted, async (req, res) => 
{
    const { email } = req.params;
    const removal = await admin.removeSubmissionsByEmail(email);
    if (removal > 0) 
    {
        return res.status(200).json({ message: "Submissions removed" });
    }
    else 
    {
        return res.status(200).json({ message: "There were no submissions" });
    }
});

router.post("/setwinners/:prompt_id", adminRestricted, async (req, res) => 
{
    try
    {
        const { prompt_id } = req.params;

        try
        {
            req.body.forEach(async (el) => 
            {
                await admin.updateTopThree(parseInt(el.story_id));
            });
        }
        catch (err)
        {
            return status(500).json({ message: `cannot update due to ${err}` });
        }

        try
        {
            req.body.forEach(async (el) => 
            {
                await admin.setWinner({ ...el, prompt_id });
            });
        }
        catch (err)
        {
            return status(500).json({ message: `cannot add top 3 due to ${err}` });
        }

        return res.status(200).json({ submissions: await admin.getSubmissionsPerTime(), users: await admin.getUsers() });
    }
    catch (err)
    {
        return res.status(500).json({ error: "Something went wrong." });
    }
});

module.exports = router;