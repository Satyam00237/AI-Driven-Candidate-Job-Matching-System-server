const { matchResume } = require("../services/geminiService");

(async () => {
  const job = {
    title: "Frontend Developer",
    description:
      "We build interactive React applications. Frontend tasks include UI, CSS, and JavaScript.",
    skills: ["React", "JavaScript", "CSS"],
  };

  const goodResume = `Experienced developer with React and JavaScript expertise. Built several single-page applications using React, Redux, and modern CSS.`;
  const badResume = `Seasoned sales manager with extensive experience in market research, customer relationships, and communication strategies.`;
  const partialResume = `Junior developer with some JavaScript experience and knowledge of HTML.`;

  console.log("Good resume ->", await matchResume(goodResume, job));
  console.log("Bad resume  ->", await matchResume(badResume, job));
  console.log("Partial resume ->", await matchResume(partialResume, job));
})();
