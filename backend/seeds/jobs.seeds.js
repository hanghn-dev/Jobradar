import { config } from "dotenv";
import { connectDB } from "../src/utils/connectDB.js";
import Job from "../src/schemaModel/jobschema.js";
import mongoose from "mongoose";
config({ path: "../.env" });

const fakeJobs = [
  {
    title: "Frontend React Developer",
    description:
      "Build modern web applications using React. We are looking for a passionate Frontend Developer who loves creating beautiful and performant user interfaces. You will work with our product team to implement new features, optimize existing components, and ensure the technical feasibility of UI/UX designs. The ideal candidate has strong experience with React hooks, context API, and modern state management (Redux Toolkit or Zustand). You should also be comfortable working with RESTful APIs and version control (Git). We value clean code, attention to detail, and a collaborative mindset. This is a great opportunity to grow your skills in a fast-paced environment with a supportive team. You will have the chance to mentor junior developers and contribute to technical decisions. Our tech stack includes React, TypeScript, Tailwind CSS, and Node.js for backend integration. If you're excited about building products that impact millions of users, we'd love to hear from you!",
    requirements: "2+ years React experience.",
    skills: ["React", "JavaScript", "Tailwind CSS", "TypeScript"],
    company: "TechNova",
    jobType: "full-time",
    experienceLevel: "mid",
    location: {
      city: "Ho Chi Minh City",
      region: "Vietnam",
    },
    workMode: "hybrid",
    salary: {
      min: 1200,
      max: 2000,
      currency: "USD",
      period: "month",
    },
    sourcePlatform: "linkedin",
    sourceUrl: "https://linkedin.com/jobs/1",
    expiredAt: new Date("2026-12-31"),
    isActive: true,
  },
  {
    title: "Junior Backend Developer",
    description: "Develop REST APIs with Node.js.",
    requirements: "Knowledge of Express and MongoDB.",
    skills: ["Node.js", "Express", "MongoDB"],
    company: "CodeCraft",
    jobType: "full-time",
    experienceLevel: "entry",
    location: {
      city: "Da Nang",
      region: "Vietnam",
    },
    workMode: "remote",
    salary: {
      min: 800,
      max: 1200,
      currency: "USD",
      period: "month",
    },
    sourcePlatform: "indeed",
    sourceUrl: "https://indeed.com/jobs/2",
    expiredAt: new Date("2026-11-30"),
    isActive: true,
  },
  {
    title: "Senior Full Stack Engineer",
    description: "Lead development of enterprise applications.",
    requirements: "5+ years experience in MERN stack.",
    skills: ["React", "Node.js", "MongoDB", "AWS", "Docker"],
    company: "GlobalTech",
    jobType: "full-time",
    experienceLevel: "senior",
    location: {
      city: "Singapore",
      region: "Singapore",
    },
    workMode: "on-site",
    salary: {
      min: 5000,
      max: 8000,
      currency: "SGD",
      period: "month",
    },
    sourcePlatform: "linkedin",
    sourceUrl: "https://linkedin.com/jobs/3",
    expiredAt: new Date("2026-10-31"),
    isActive: true,
  },
  {
    title: "Freelance UI/UX Designer",
    description: "Create wireframes and design systems.",
    requirements: "Portfolio required.",
    skills: ["Figma", "UI Design", "UX Research"],
    company: "Creative Studio",
    jobType: "freelance",
    experienceLevel: "mid",
    location: {
      city: "Ha Noi",
      region: "Vietnam",
    },
    workMode: "remote",
    salary: {
      min: 20,
      max: 40,
      currency: "USD",
      period: "hour",
    },
    sourcePlatform: "facebook",
    sourceUrl: "https://facebook.com/jobs/4",
    expiredAt: new Date("2026-09-30"),
    isActive: true,
  },
  {
    title: "Part-Time React Tutor",
    description: "Teach React fundamentals to beginners.",
    requirements: "Strong React knowledge.",
    skills: ["React", "Teaching", "JavaScript", "Tailwind CSS"],
    company: "Dev Academy",
    jobType: "part-time",
    experienceLevel: "senior",
    location: {
      city: "Seoul",
      region: "South Korea",
    },
    workMode: "hybrid",
    salary: {
      min: 30,
      max: 60,
      currency: "USD",
      period: "hour",
    },
    sourcePlatform: "toptal",
    sourceUrl: "https://toptal.com/jobs/5",
    expiredAt: new Date("2026-08-31"),
    isActive: true,
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();
    await Job.deleteMany({});
    await Job.insertMany(fakeJobs);
    console.log("Database seeded successfully");
  } catch (error) {
    console.log("Error Seeding database", error.message);
  } finally {
    mongoose.disconnect();
  }
};
seedDatabase();
