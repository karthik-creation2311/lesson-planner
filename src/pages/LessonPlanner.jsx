import { useState, } from "react";
import axios from "axios";
import jsPDF from "jspdf";
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
        } catch (err) {
            setError("Failed to generate lesson. Please try again.");
        }

        setLoading(false);
    };

    const downloadPDF = () => {
        if (!generatedLesson) return;

        const doc = new jsPDF();
        doc.setFont("helvetica", "bold");
        doc.setFontSize(16);
        doc.text("Lesson Plan", 105, 15, { align: "center" });

        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");

        const markdownText = generatedLesson.replace(/\*\*(.*?)\*\*/g, "$1"); // Remove markdown bold

        // Convert Markdown content into PDF sections
        const sections = markdownText.split("\n\n"); // Split into paragraphs
        let y = 25;

        sections.forEach((section) => {
            if (section.startsWith("-")) {
                // Bullet points handling
                const bullets = section.split("\n");
                bullets.forEach((bullet, index) => {
                    doc.text(`• ${bullet.replace(/^- /, "")}`, 15, y + index * 6);
                });
                y += bullets.length * 6 + 5;
            } else {
                // Normal text (headers or paragraphs)
                const wrappedText = doc.splitTextToSize(section, 180);
                doc.text(wrappedText, 15, y);
                y += wrappedText.length * 6 + 5;
            }
        });

        doc.save(`${lessonData.topic || "LessonPlan"}.pdf`);
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
