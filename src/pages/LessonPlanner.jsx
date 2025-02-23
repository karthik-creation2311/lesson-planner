import { useState, } from "react";
import axios from "axios";
import {useReactToPrint} from "react-to-print";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";


const API_KEY = import.meta.env.VITE_GEMINI_API_KEY; //
console.log(API_KEY);

function LessonPlanner() {
    const [lessonData, setLessonData] = useState({
        topic: "",
        gradeLevel: "",
        mainConcept: "",
        subtopics: "",
        materials: "",
        objectives: "",
    });
    const [extractedData, setExtractedData] = useState({});
    const [generatedLesson, setGeneratedLesson] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleChange = (e) => {
        setLessonData({ ...lessonData, [e.target.name]: e.target.value });
    };

    const generateLessonPlan = async () => {
        setLoading(true);
        setError("");

        const prompt = `Generate a detailed lesson plan for the topic: ${lessonData.topic}.\n
      - Grade Level: ${lessonData.gradeLevel}\n
      - Main Concept: ${lessonData.mainConcept}\n
      - Subtopics: ${lessonData.subtopics}\n
      - Materials Needed: ${lessonData.materials}\n
      - Learning Objectives: ${lessonData.objectives}\n
      - Lesson Outline: ${lessonData.outline}\n
      Provide a structured response with lesson content, activities, and assessment questions.`;



        try {
            const response = await axios.post(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
                {
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ]
                }

            );

            const lessonText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "No response generated.";
            setGeneratedLesson(lessonText);
            setExtractedData(parseMarkdownLessonPlan(lessonText));
        } catch (err) {
            setError("Failed to generate lesson. Please try again.");
        }

        setLoading(false);
    };

    //  Function to handle PDF generation
    // const printRef = useRef();
    // const handlePrint = useReactToPrint({
    //     content: () => printRef.current,
    //     documentTitle: "Lesson Plan",
    // });


    //
    // const downloadPDF = () => {
    //     const doc = new jsPDF();
    //
    //     doc.setFont("helvetica", "bold");
    //     doc.setFontSize(16);
    //     doc.text("Lesson Plan", 105, 15, { align: "center" });
    //
    //     doc.setFontSize(12);
    //     doc.setFont("helvetica", "normal");
    //
    //     // Extracting Lesson Data (Assuming this is parsed from API)
    //     const lessonData = {
    //         topic: "HTML Tables",
    //         gradeLevel: "6",
    //         mainConcept: "Creating and styling HTML tables",
    //         subtopics: "<table>, <tr>, <td>, <th>, border, height, table design using attributes and simple CSS",
    //         materials: "PDFs (examples of HTML code with tables, instructions for activities), computer lab, projector",
    //         objectives: [
    //             "Understand the basic structure of an HTML table.",
    //             "Create a simple HTML table using <table>, <tr>, <td>, and <th> tags.",
    //             "Adjust table appearance using border and height attributes.",
    //             "Apply knowledge to create a basic HTML table."
    //         ],
    //         outline: [
    //             ["15 min", "Introduction", "Show real-world examples"],
    //             ["20 min", "Basic Table Structure", "Walk through example code"],
    //             ["20 min", "Table Styling", "Add borders and heights"],
    //             ["15 min", "Advanced Table Design", "Introduce CSS styling"],
    //             ["10 min", "Assessment", "Review key concepts"]
    //         ],
    //         assessment: [
    //             "Write the HTML code to create a table with two rows and three columns.",
    //             "How do you add a border to an HTML table? Provide an example.",
    //             "What is the purpose of the <th> tag?",
    //             "What is one way to make your table visually appealing?",
    //             "Explain how using CSS improves table design."
    //         ]
    //     };
    //
    //     // Function to add section headers
    //     const addSection = (title, content, yPos) => {
    //         doc.setFont("helvetica", "bold");
    //         doc.text(title, 15, yPos);
    //         doc.setFont("helvetica", "normal");
    //         const splitContent = doc.splitTextToSize(content, 180);
    //         doc.text(splitContent, 15, yPos + 6);
    //         return yPos + 10 + (splitContent.length * 6);
    //     };
    //
    //     let y = 25;
    //     y = addSection("Topic:", lessonData.topic, y);
    //     y = addSection("Grade Level:", lessonData.gradeLevel, y);
    //     y = addSection("Main Concept:", lessonData.mainConcept, y);
    //     y = addSection("Subtopics:", lessonData.subtopics, y);
    //     y = addSection("Materials Needed:", lessonData.materials, y);
    //
    //     // Learning Objectives
    //     doc.setFont("helvetica", "bold");
    //     doc.text("Learning Objectives:", 15, y);
    //     doc.setFont("helvetica", "normal");
    //     lessonData.objectives.forEach((obj, index) => {
    //         doc.text(`- ${obj}`, 15, y + (index + 1) * 6);
    //     });
    //     y += lessonData.objectives.length * 6 + 10;
    //
    //     // Lesson Outline as a Table
    //     doc.setFont("helvetica", "bold");
    //     doc.text("Lesson Outline:", 15, y);
    //     doc.setFont("helvetica", "normal");
    //
    //     autoTable(doc, {
    //         startY: y + 5,
    //         head: [["Duration", "Guide", "Remarks"]],
    //         body: lessonData.outline,
    //         theme: "grid",
    //         styles: { fontSize: 10 },
    //     });
    //
    //     let yAfterTable = doc.lastAutoTable.finalY + 10;
    //
    //     // Assessment Questions
    //     doc.setFont("helvetica", "bold");
    //     doc.text("Assessment Questions:", 15, yAfterTable);
    //     doc.setFont("helvetica", "normal");
    //
    //     lessonData.assessment.forEach((question, index) => {
    //         doc.text(`${index + 1}. ${question}`, 15, yAfterTable + (index + 1) * 6);
    //     });
    //
    //     // Save PDF
    //     doc.save(`${lessonData.topic}_LessonPlan.pdf`);
    // };


    // Function to extract key data from AI response
    // const extractLessonData = (text) => {
    //     const extractSection = (label) => {
    //         const regex = new RegExp(`${label}:\\s*([^\\n]+)`, "i");
    //         const match = text.match(regex);
    //         return match ? match[1].trim() : "Not Provided";
    //     };
    //
    //     return {
    //         topic: extractSection("Topic"),
    //         gradeLevel: extractSection("Grade Level"),
    //         mainConcept: extractSection("Main Concept"),
    //         subtopics: extractSection("Subtopics"),
    //         materials: extractSection("Materials Needed"),
    //         objectives: extractSection("Learning Objectives"),
    //         lessonOutline: extractSection("Lesson Outline"),
    //         assessment: extractSection("Assessment Questions"),
    //     };
    // };
    const parseMarkdownLessonPlan = (markdown) => {
        // Convert Markdown to plain text
        const plainText = markdown
            .replace(/\*\*(.*?)\*\*/g, "$1")  // Bold
            .replace(/\*(.*?)\*/g, "$1")      // Italic
            .replace(/`(.*?)`/g, "$1")        // Inline code
            .replace(/###?\s?(.*?)/g, "$1")   // Headers
            .replace(/-\s(.*?)/g, "$1")       // Bullets
            .trim();

        const lessonData = {};

        // Regular expressions to capture the required fields
        const regexPatterns = {
            topic: /Topic:\s*(.+)/,
            gradeLevel: /Grade Level:\s*(.+)/,
            mainConcept: /Main Concept:\s*(.+)/,
            subtopics: /Subtopics:\s*(.+)/,
            materials: /Materials Needed:\s*(.+)/,
            objectives: /Learning Objectives:\s*([\s\S]+?)(?=\n\nLesson Outline)/ // Capture multi-line objectives
        };

        // Apply regex patterns
        for (const key in regexPatterns) {
            const match = plainText.match(regexPatterns[key]);
            lessonData[key] = match ? match[1].trim() : "N/A";
        }

        // Convert bullet points in Learning Objectives to an array
        if (lessonData.objectives !== "N/A") {
            lessonData.objectives = lessonData.objectives
                .split("\n")
                .map(line => line.replace(/^\*\s*/, "").trim()) // Remove "* " from each point
                .filter(line => line.length > 0); // Remove empty lines
        }

        return lessonData;
    };




    const downloadPDF = () => {
        console.log(extractedData);
        const doc = new jsPDF();

        // Set title
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("Lesson Plan", 105, 15, { align: "center" });

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        // Function to add sections
        const addSection = (title, content, yPos) => {
            if (!content || content === "N/A") return yPos; // Skip empty sections

            doc.setFont("helvetica", "bold");
            doc.text(title, 15, yPos);
            doc.setFont("helvetica", "normal");

            const splitContent = doc.splitTextToSize(content, 180);
            doc.text(splitContent, 15, yPos + 6);
            return yPos + 10 + splitContent.length * 6;
        };

        let y = 25;
        y = addSection("Topic:", extractedData.topic, y);
        y = addSection("Grade Level:", extractedData.gradeLevel, y);
        y = addSection("Main Concept:", extractedData.mainConcept, y);
        y = addSection("Subtopics:", extractedData.subtopics, y);
        y = addSection("Materials Needed:", extractedData.materials, y);

        // Learning Objectives (as bullet points)
        if (extractedData.objectives.length > 0) {
            doc.setFont("helvetica", "bold");
            doc.text("Learning Objectives:", 15, y);
            doc.setFont("helvetica", "normal");

            extractedData.objectives.forEach((objective, index) => {
                doc.text(`• ${objective}`, 20, y + (index + 1) * 6);
            });

            y += extractedData.objectives.length * 6 + 10;
        }

        doc.save(`${extractedData.topic}_LessonPlan.pdf`);
    };





    return (
        <div className="min-h-screen bg-gray-100 p-6">
            <div className="max-w-2xl mx-auto">
                <Card className="p-6 bg-white rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Lesson Planner</h2>
                    <form>
                        <div className="mb-4">
                            <label className="block text-gray-700">Topic</label>
                            <Input type="text" name="topic" value={lessonData.topic} onChange={handleChange} />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Grade Level</label>
                            <Input type="text" name="gradeLevel" value={lessonData.gradeLevel} onChange={handleChange} />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Main Concept</label>
                            <Input type="text" name="mainConcept" value={lessonData.mainConcept} onChange={handleChange} />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Subtopics</label>
                            <Textarea name="subtopics" value={lessonData.subtopics} onChange={handleChange} />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Materials Needed</label>
                            <Textarea name="materials" value={lessonData.materials} onChange={handleChange} />
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-700">Learning Objectives</label>
                            <Textarea name="objectives" value={lessonData.objectives} onChange={handleChange} />
                        </div>

                        <Accordion type="single" collapsible className="mb-4">
                            <AccordionItem value="outline" title="Lesson Outline">
                                <Textarea name="outline" value={lessonData.outline} onChange={handleChange} />
                            </AccordionItem>
                        </Accordion>

                        <Button type="button" className="w-full mt-4 bg-green-500" onClick={generateLessonPlan} disabled={loading}>
                            {loading ? "Generating..." : "Generate Lesson Plan"}
                        </Button>
                    </form>

                    {error && <p className="text-red-500 mt-2">{error}</p>}

                    {generatedLesson && (
                        <div  className="mt-6 p-4 bg-gray-100 rounded">
                            <h3 className="text-lg font-semibold mb-2">Generated Lesson Plan</h3>
                            <ReactMarkdown>{generatedLesson}</ReactMarkdown>
                        </div>
                    )}

                    {/*  Download as PDF Button */}
                    {generatedLesson && (
                        <Button className="w-full mt-4 bg-green-500"  onClick={downloadPDF}>
                            Download as PDF
                        </Button>
                    )}

                </Card>
            </div>
        </div>
    );
}

export default LessonPlanner;
