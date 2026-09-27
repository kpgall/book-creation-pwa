import express from "express";
import cors from "cors";
import "dotenv/config";
import OpenAI from "openai";

const app=express();
app.use(cors());
app.use(express.json({limit:"1mb"}));

const client=new OpenAI({apiKey:process.env.OPENAI_API_KEY});

function common(p){
return `You are assisting with a book-creation workflow.
Title: ${p.title||"Untitled"}
Book type: ${p.bookType||"Not specified"}
Series: ${p.series||"None"}
Audience: ${p.audience||"Not specified"}
Target word count: ${p.wordTarget||"Not specified"}
Tone/style: ${p.tone||"Not specified"}
Premise: ${p.premise||"Not supplied"}
Notes: ${p.notes||"None"}`;
}

app.get("/health",(req,res)=>res.json({ok:true}));

app.post("/api/generate",async(req,res)=>{
try{
const {action,payload:p={}}=req.body||{};
let prompt="";
if(action==="developIdea") prompt=`${common(p)}\nDevelop the premise into a concise, useful story concept. Include the central problem, emotional arc, gentle resolution and any important recurring motif. Do not write the full story yet.`;
else if(action==="generateDraft") prompt=`${common(p)}\nWrite a complete story draft suitable for the stated audience and target length. Keep language read-aloud friendly and preserve the requested tone. Return only the story text.`;
else if(action==="reviseStory") prompt=`${common(p)}\nCurrent manuscript:\n${p.manuscript||""}\nRevise the manuscript while preserving its core idea. Improve pacing, clarity, read-aloud rhythm, age suitability and emotional progression. Return only the revised story.`;
else if(action==="pagePlan"){
 const s=p.structure||{}, count=Math.max(1, s.mode==="pages" ? ((s.pageCount||24)-(s.frontPages||3)-(s.endPages||1)) : Math.ceil(((s.pageCount||24)-(s.frontPages||3)-(s.endPages||1))/2));
 prompt=`${common(p)}\nManuscript:\n${p.manuscript||""}\nCreate an intelligent picture-book page plan based on narrative and illustration beats, not equal word counts. You may use fewer than the maximum ${count} story units if pacing is better. Structure: ${JSON.stringify(s)}. Return strict JSON only in this shape: {"plan":[{"pages":"4–5","type":"Story Spread","title":"short scene title","text":"exact manuscript text allocated to this unit","scene":"visual/narrative scene description","illustration":"clear illustration brief","notes":""}]}. Allocate manuscript text in order without rewriting or omitting it.`;
}else return res.status(400).json({error:"Unknown action"});
const response=await client.responses.create({model:process.env.OPENAI_MODEL||"gpt-5-mini",input:prompt});
const out=response.output_text?.trim()||"";
if(action==="pagePlan"){
 const clean=out.replace(/^```json\s*/i,"").replace(/```$/,"").trim();
 return res.json(JSON.parse(clean));
}
res.json({text:out});
}catch(err){console.error(err);res.status(500).json({error:err.message||"Generation failed"});}
});

const port=process.env.PORT||3000;
app.listen(port,()=>console.log(`Generation service listening on ${port}`));
