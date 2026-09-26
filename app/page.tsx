"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform, animate } from "framer-motion";
import { ArrowRight, ArrowLeft, Heart, X, RotateCcw, MapPin, BadgeCheck, MessageCircle, Send, Sparkles, Layers, UserRound, CheckCheck, ChevronRight, ShieldCheck } from "lucide-react";
import { Dialog, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Dialog as DialogPrimitive } from "radix-ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { profiles, women, men, type Profile, type ProfileGender } from "@/lib/profiles";

type Choice = "like" | "pass" | "plot";
type Preference = "everyone" | ProfileGender;
type ChatMessage = { id: string; from: "user" | "match"; text: string };
type Tool = {name: string; title: string; description: string; inputSchema: object; annotations: {readOnlyHint: boolean; untrustedContentHint: boolean}; execute: (input: unknown) => unknown | Promise<unknown>};
type ModelContext = {registerTool: (tool: Tool, options: {signal: AbortSignal}) => void | Promise<void>};

function Mark({className = ""}: {className?: string}) {
  return <svg className={`brand-mark ${className}`} width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M5 26V6L15 17M27 6V26L17 15" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/></svg>;
}
function Wordmark({small = false}: {small?: boolean}) {
  return <span className={`wordmark ${small ? "small" : ""}`}><Mark/><span>NEVERMEET<span className="wordmark-period">.</span></span></span>;
}
function ProfileCard({profile, deckPosition, deckTotal, onChoice, disabled}: {profile: Profile; deckPosition: number; deckTotal: number; onChoice: (choice: Choice) => void; disabled: boolean}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-220, 220], [-16, 16]);
  const likeOpacity = useTransform(x, [15, 100], [0, 1]);
  const nopeOpacity = useTransform(x, [-100, -15], [1, 0]);
  const reduced = useReducedMotion();
  return <motion.article
    className="profile-card" data-profile={profile.id}
    aria-label={`${profile.name}, ${profile.age}, fictional profile`}
    style={{x, rotate}} drag={disabled ? false : "x"} dragConstraints={{left: 0, right: 0}} dragElastic={0.82}
    dragMomentum={false}
    onDragEnd={(_, info) => {
      if (info.offset.x > 82 || (info.offset.x > 25 && info.velocity.x > 550)) onChoice("like");
      else if (info.offset.x < -82 || (info.offset.x < -25 && info.velocity.x < -550)) onChoice("pass");
      else animate(x, 0, {type: "spring", stiffness: 380, damping: 28});
    }}
    initial={{opacity: 0, scale: 0.97}} animate={{opacity: 1, scale: 1}}
    exit={disabled ? undefined : {opacity: 0}} transition={{duration: reduced ? 0 : 0.25}}
  >
    <img className="profile-photo" src={profile.image} alt={`Portrait used for fictional profile ${profile.name}`} draggable={false} style={{objectPosition: profile.position}} fetchPriority={profile.id === "maya" ? "high" : "auto"}/>
    <div className="photo-shade"/>
    <div className="card-top"><span className="fictional-label"><Sparkles size={12}/> FICTIONAL, OBVIOUSLY</span><span className="deck-position">{deckPosition} / {deckTotal}</span></div>
    <motion.span className="swipe-stamp like-stamp" style={{opacity: likeOpacity}}>LIKE</motion.span>
    <motion.span className="swipe-stamp nope-stamp" style={{opacity: nopeOpacity}}>NOPE</motion.span>
    <div className="profile-info">
      <div className="profile-name"><h3>{profile.name}<span>, {profile.age}</span></h3><BadgeCheck size={23} fill="#8bc6ff" color="#112f55" aria-label="Verified fictional"/></div>
      <p className="profile-location"><MapPin size={14}/>{profile.city}<span>·</span>{profile.distance}</p>
      <p className="profile-bio">{profile.bio}</p>
      <div className="interests">{profile.interests.map(item => <span key={item}>{item}</span>)}</div>
    </div>
  </motion.article>;
}

function buildEveryoneDeck() {
  return Array.from({length: Math.max(women.length, men.length)}, (_, index) => [women[index], men[index]])
    .flat()
    .filter((profile): profile is Profile => Boolean(profile));
}

function createReply(profile: Profile, message: string, turn: number) {
  const text = message.toLowerCase();
  if (/meet|date|coffee|drink|pint|dinner|lunch|food/.test(text)) {
    return [
      "That sounds perfect. Let's both go separately and never compare notes.",
      "I'd love to. How does a place we never choose at a time we never confirm sound?",
      "Bold of you to suggest leaving the chat. I thought what we had was special.",
    ][turn % 3];
  }
  if (/when|tonight|tomorrow|weekend|free/.test(text)) {
    return ["I'm free any day that doesn't actually happen.", "Next Thursday is ideal. We can cancel on Wednesday to keep the spark alive."][turn % 2];
  }
  if (/where|place|location/.test(text)) return "Somewhere between here and a complete lack of follow-through.";
  if (/number|whatsapp|insta|instagram/.test(text)) return "Let's keep this relationship exactly where it thrives: inside a fictional browser tab.";
  if (/hello|\bhi\b|\bhey\b/.test(text)) return "Hey. Strong start. Let's not ruin it by making plans.";

  const replies: Record<Profile["replyStyle"], string[]> = {
    dry: ["Huge if true. Anyway, shall we never circle back?", "I respect that. Let's leave it beautifully unresolved.", "Excellent. No notes, no plans."],
    warm: ["Honestly, this imaginary connection has made my evening.", "I like where this is going — absolutely nowhere, very comfortably.", "That's cute. We should treasure it from a safe distance."],
    chaotic: ["Perfect. I've already invented our holiday and cancelled the airport taxi.", "This is moving fast. I've deleted the calendar invite we never made.", "Amazing. I'll tell my houseplants it almost worked out."],
    flirty: ["Careful, keep talking like that and I might nearly suggest a date.", "Dangerously charming. Good thing we'll never test the chemistry in person.", "You're making not meeting you surprisingly difficult."],
  };
  return replies[profile.replyStyle][turn % replies[profile.replyStyle].length];
}

export default function Home() {
  const [index, setIndex] = useState(0);
  const [preference, setPreference] = useState<Preference>("everyone");
  const [history, setHistory] = useState<number[]>([]);
  const [matches, setMatches] = useState<string[]>([]);
  const [match, setMatch] = useState<Profile | null>(null);
  const [matchChoice, setMatchChoice] = useState<Choice>("like");
  const [tab, setTab] = useState("discover");
  const [chat, setChat] = useState<Profile | null>(null);
  const [messages, setMessages] = useState<Record<string, ChatMessage[]>>({});
  const [replying, setReplying] = useState<Record<string, boolean>>({});
  const [draft, setDraft] = useState("");
  const [leaving, setLeaving] = useState<Choice | null>(null);
  const [notice, setNotice] = useState("");
  const phoneRef = useRef<HTMLDivElement>(null);
  const chatLogRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const reduced = useReducedMotion();
  const deck = useMemo(() => preference === "woman" ? women : preference === "man" ? men : buildEveryoneDeck(), [preference]);
  const current = deck[index];
  const nextProfile = deck[index + 1];

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => { if (!notice) return; const t = setTimeout(() => setNotice(""), 2800); return () => clearTimeout(t); }, [notice]);
  useEffect(() => {
    const log = chatLogRef.current;
    if (!log) return;
    log.scrollTo({top: log.scrollHeight, behavior: reduced ? "instant" : "smooth"});
  }, [messages, chat, replying, reduced]);
  useEffect(() => { setDraft(""); }, [chat]);

  const choose = useCallback((choice: Choice): Promise<object> => {
    if (!current || busy.current || match || chat || tab !== "discover") return Promise.resolve({ok:false, reason:"Open Discover and close any match first."});
    busy.current = true;
    setLeaving(choice);
    return new Promise(resolve => {
      timers.current.push(setTimeout(() => {
        setHistory(prev => [...prev, index]);
        setIndex(prev => prev + 1);
        setLeaving(null);
        if (choice !== "pass") {
          setMatches(prev => prev.includes(current.id) ? prev : [...prev, current.id]);
          setMatchChoice(choice);
          setMatch(current);
        } else setNotice("No hard feelings. Literally.");
        busy.current = false;
        requestAnimationFrame(() => requestAnimationFrame(() => resolve({ok:true, profile:current.name, action:choice, matched:choice !== "pass"})));
      }, reduced ? 0 : 300));
    });
  }, [current, index, match, chat, tab, reduced]);

  const rewind = useCallback(() => {
    if (busy.current || !history.length || match || chat) return;
    setIndex(history[history.length - 1]);
    setHistory(prev => prev.slice(0, -1));
    setNotice("One more look. No judgement.");
  }, [history, match, chat]);

  const sendMessage = useCallback((text: string) => {
    const clean = text.trim().slice(0, 500);
    if (!chat || !clean) return {ok:false, reason:"Open a conversation and enter a message."};
    const profile = chat;
    const turn = (messages[profile.id] || []).filter(message => message.from === "user").length;
    const userMessage: ChatMessage = {id:`user-${Date.now()}-${turn}`, from:"user", text:clean};
    const reply = createReply(profile, clean, turn);
    setMessages(prev => ({...prev, [profile.id]: [...(prev[profile.id] || []), userMessage]}));
    setReplying(prev => ({...prev, [profile.id]: true}));
    setDraft("");
    timers.current.push(setTimeout(() => {
      const matchMessage: ChatMessage = {id:`match-${Date.now()}-${turn}`, from:"match", text:reply};
      setMessages(prev => ({...prev, [profile.id]: [...(prev[profile.id] || []), matchMessage]}));
      setReplying(prev => ({...prev, [profile.id]: false}));
    }, reduced ? 80 : 850 + (turn % 3) * 250));
    return {ok:true, recipient:profile.name, simulated:true, reply_pending:true};
  }, [chat, messages, reduced]);

  function startSwiping() {
    setChat(null); setMatch(null); setTab("discover");
    phoneRef.current?.scrollIntoView({behavior: reduced ? "instant" : "smooth", block: "center"});
    phoneRef.current?.focus({preventScroll:true});
  }
  function openChat(profile: Profile) { setMatch(null); setTab("messages"); setChat(profile); }
  function restart() { setIndex(0); setHistory([]); setNotice("New round. Same excellent taste."); }
  function changePreference(value: string) {
    const next = value as Preference;
    if (!(["everyone", "woman", "man"] as string[]).includes(next) || next === preference) return;
    setPreference(next); setIndex(0); setHistory([]); setMatch(null); setChat(null); setTab("discover");
    setNotice(next === "everyone" ? "Showing everyone. Maximum fictional possibility." : `Showing 20 ${next === "woman" ? "women" : "men"}.`);
  }

  const actionRef = useRef({choose, rewind, sendMessage, changePreference, current, match, chat, matches, tab, preference});
  actionRef.current = {choose, rewind, sendMessage, changePreference, current, match, chat, matches, tab, preference};
  useEffect(() => {
    const context = (document as Document & {modelContext?: ModelContext}).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    const register = (tool: Tool) => { try { Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(() => {}); } catch {} };
    register({name:"read_nevermeet_state",title:"Read dating simulation",description:"Read the visible fictional profile, match and chat state. All profiles are fictional.",inputSchema:{type:"object",properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:() => {
      const s=actionRef.current; return {view:s.chat ? "chat" : s.match ? "match" : s.tab, preference:s.preference, profile:s.current ? {id:s.current.id,name:s.current.name,age:s.current.age,city:s.current.city} : null,match:s.match?.id || null,chat:s.chat?.id || null,matches:s.matches};
    }});
    register({name:"set_profile_preference",title:"Choose profiles",description:"Choose whether Discover shows fictional women, men or everyone, and restart the current deck.",inputSchema:{type:"object",properties:{preference:{type:"string",enum:["woman","man","everyone"]}},required:["preference"],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:(input) => {
      const data=input as {preference?: unknown}; if(!data || !["woman","man","everyone"].includes(String(data.preference)) || Object.keys(data).some(k=>k!=="preference")) throw new Error("preference must be woman, man or everyone"); actionRef.current.changePreference(String(data.preference)); return {ok:true,preference:data.preference};
    }});
    register({name:"swipe_fictional_profile",title:"Swipe fictional profile",description:"Like, pass or add a plot twist to the currently visible fictional profile. A like opens a simulated match. Never contacts anyone.",inputSchema:{type:"object",properties:{action:{type:"string",enum:["like","pass","plot"]}},required:["action"],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:(input) => {
      const data=input as {action?: unknown}; if(!data || !["like","pass","plot"].includes(String(data.action)) || Object.keys(data).some(k=>k!=="action")) throw new Error("action must be like, pass or plot"); return actionRef.current.choose(data.action as Choice);
    }});
    register({name:"send_simulated_message",title:"Send simulated message",description:"Add a message to the open fictional chat. The message remains in this page's memory and is never sent to anyone.",inputSchema:{type:"object",properties:{text:{type:"string",minLength:1,maxLength:500}},required:["text"],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:true},execute:async(input) => {
      const data=input as {text?:unknown}; if(!data || typeof data.text!=="string" || !data.text.trim() || data.text.length>500 || Object.keys(data).some(k=>k!=="text")) throw new Error("Enter a message of 1–500 characters"); const result=actionRef.current.sendMessage(data.text); await new Promise(requestAnimationFrame); return result;
    }});
    return () => lifecycle.abort();
  }, []);

  return <main>
    <header className="site-header wrap">
      <a href="#" className="brand-link" aria-label="NEVERMEET home"><Wordmark/></a>
      <nav aria-label="Main navigation"><a className="nav-how" href="#how-it-works">How it works</a><button className="nav-cta" onClick={startSwiping}>Let's not meet <ArrowRight size={16}/></button></nav>
    </header>

    <section className="hero wrap" aria-labelledby="hero-title">
      <div className="hero-copy">
        <div className="promise-pill"><span className="little-star">✳</span>No signup <span>·</span> No rejection <span>·</span> No actual date</div>
        <h1 id="hero-title">Match.<br/>{" "}Flirt.<br/>{" "}<span>Never meet.</span></h1>
        <p className="hero-description">All the butterflies.<br className="desktop-break"/> None of the “so, what are we?”</p>
        <p className="hero-support">Swipe, match and flirt without the inconvenience of actually meeting anyone.</p>
        <div className="hero-actions"><button className="button-primary" onClick={startSwiping}>Start swiping <ArrowRight size={20}/></button><a className="text-link" href="#how-it-works">How it works <span>↗</span></a></div>
        <p className="hero-footnote"><ShieldCheck size={15}/> Real dopamine. Entirely fictional people.</p>
      </div>

      <div className={`experience-stage ${match || chat ? "in-conversation" : ""}`}>
        <div className="stage-orbit" aria-hidden="true"/>
        <div className="floating-note top-note" aria-hidden="true"><span className="note-icon"><Heart size={18} fill="currentColor"/></span><div><strong>Your type. Allegedly.</strong><span>Great chemistry. Zero logistics.</span></div></div>
        <div className="phone" id="swipe" ref={phoneRef} tabIndex={0} aria-label="NEVERMEET dating simulation" onKeyDown={event => {
          if ((event.target as HTMLElement).closest("input,textarea,button,a,[role=tab]")) return;
          if (event.key === "ArrowRight") {event.preventDefault();void choose("like");}
          if (event.key === "ArrowLeft") {event.preventDefault();void choose("pass");}
        }}>
          <div className="phone-hardware" aria-hidden="true"><span>9:41</span><span className="camera-pill"/><span className="signal-bars">▮▮▮ <span className="battery"/></span></div>
          <div className="phone-app">
            <div className="app-header"><Wordmark small/><span className="demo-badge">JUST FOR FUN</span></div>
            <Tabs value={tab} onValueChange={value=>{setTab(value);setChat(null);}} className="phone-tabs">
              {tab === "discover" ? <TabsContent value="discover" className="discover-view" aria-label="Discover">
                <div className="discover-heading-row"><div className="discover-title"><h2>A little chemistry.</h2><span>Zero commitment.</span></div>
                  <RadioGroup className="preference-selector" value={preference} onValueChange={changePreference} aria-label="Show me" disabled={Boolean(leaving)}>
                    <label><RadioGroupItem value="everyone"/><span>Everyone</span></label>
                    <label><RadioGroupItem value="woman"/><span>Women</span></label>
                    <label><RadioGroupItem value="man"/><span>Men</span></label>
                  </RadioGroup>
                </div>
                <div className={`card-deck ${leaving ? `leaving-${leaving}` : ""}`}>
                  {nextProfile && <div className="card-behind" aria-hidden="true"><img src={nextProfile.image} alt=""/></div>}
                  <AnimatePresence initial={false} mode="wait">
                    {current ? <ProfileCard key={`${preference}-${current.id}`} profile={current} deckPosition={index + 1} deckTotal={deck.length} onChoice={choice=>void choose(choice)} disabled={Boolean(leaving)}/>
                      : <motion.div className="deck-empty" initial={{opacity:0}} animate={{opacity:1}} key="empty"><span className="empty-icon"><Sparkles size={32}/></span><h3>You've met<br/>absolutely no one.</h3><p>And honestly? A very successful session.</p><button className="button-primary compact" onClick={restart}>Another round <RotateCcw size={16}/></button><button className="text-link" onClick={()=>setTab("messages")}>See your matches <ArrowRight size={16}/></button></motion.div>}
                  </AnimatePresence>
                </div>
                <TooltipProvider><div className="swipe-controls" aria-label="Swipe controls">
                  <button className="control rewind" onClick={rewind} disabled={!history.length || Boolean(leaving)} aria-label="Rewind last swipe" title="Rewind"><RotateCcw size={22}/></button>
                  <button className="control pass" onClick={()=>void choose("pass")} disabled={!current || Boolean(leaving)} aria-label="Pass on profile" title="Pass"><X size={32} strokeWidth={2.5}/></button>
                  <button className="control like" onClick={()=>void choose("like")} disabled={!current || Boolean(leaving)} aria-label="Like profile" title="Like"><Heart size={29} fill="currentColor"/></button>
                  <Tooltip><TooltipTrigger asChild><button className="control plot" onClick={()=>void choose("plot")} disabled={!current || Boolean(leaving)} aria-label="Add a plot twist" aria-describedby="plot-twist-help"><Sparkles size={23}/></button></TooltipTrigger><TooltipContent id="plot-twist-help" side="top">Plot Twist — make it dramatically imaginary</TooltipContent></Tooltip>
                </div></TooltipProvider>
                <div className="swipe-helper" aria-live="polite">{notice || <><span>← pass</span><span>drag to decide</span><span>like →</span></>}</div>
              </TabsContent> : <TabsContent value="messages" className="messages-view" aria-label="Messages">
                <h2>Your almost-somethings<span>{matches.length}</span></h2><p className="messages-subtitle">Promising starts. No actual plans.</p>
                {matches.length ? <div className="match-list">{matches.map(id=>{const p=profiles.find(p=>p.id===id)!;const last=messages[id]?.at(-1);return <button className="match-row" key={id} onClick={()=>openChat(p)}><img src={p.image} alt=""/><span><strong>{p.name}<BadgeCheck size={15}/></strong><small>{replying[id] ? "Typing an excuse…" : last?.text || "You matched. Naturally."}</small></span><ChevronRight size={18}/></button>;})}</div>
                : <div className="messages-empty"><MessageCircle size={36}/><h3>Your inbox is playing it cool.</h3><p>A right swipe will fix that.</p><button className="button-primary compact" onClick={()=>setTab("discover")}>Find a match <Heart size={16}/></button></div>}
              </TabsContent>}
              <TabsList className="app-nav" aria-label="Dating app views"><TabsTrigger value="discover" className="app-nav-item"><Layers size={19}/><span>Discover</span></TabsTrigger><TabsTrigger value="messages" className="app-nav-item"><span className="nav-message-icon"><MessageCircle size={19}/>{matches.length>0&&<i>{matches.length}</i>}</span><span>Messages</span></TabsTrigger></TabsList>
            </Tabs>
            <AnimatePresence>{chat && <motion.section className="chat-screen" key={chat.id} initial={{x:"100%"}} animate={{x:0}} exit={{x:"100%"}} transition={{type:"tween",duration:reduced?0:0.25}} aria-label={`Chat with ${chat.name}`}>
              <header className="chat-header"><button className="icon-button" aria-label="Back to matches" onClick={()=>setChat(null)}><ArrowLeft size={22}/></button><img src={chat.image} alt=""/><div><strong>{chat.name}<BadgeCheck size={15}/></strong><span>Fictional. Emotionally unavailable.</span></div></header>
              <div className="chat-log" ref={chatLogRef} role="log" aria-live="polite"><p className="chat-date">TODAY, IN YOUR IMAGINATION</p><div className="chat-intro"><Heart size={17}/><p>You and {chat.name} matched.<br/><span>Of course you did.</span></p></div><div className="bubble incoming">{chat.opener}</div>{(messages[chat.id]||[]).map((message,i)=><div className={`chat-message ${message.from}`} key={message.id}><div className={`bubble ${message.from === "user" ? "outgoing" : "incoming"}`}>{message.text}</div>{message.from === "user" && i===(messages[chat.id]?.length||0)-1 && !replying[chat.id] && <span className="message-seen"><CheckCheck size={13}/> Seen by someone who isn't real.</span>}</div>)}{replying[chat.id]&&<div className="typing-block"><span className="typing-dots" aria-hidden="true"><i/><i/><i/></span><p>Typing a reason not to meet…</p></div>}{Boolean(messages[chat.id]?.length) && !replying[chat.id] && messages[chat.id].at(-1)?.from === "match" && <p className="void-status">Conversation successfully going nowhere.</p>}</div>
              <form className="chat-compose" onSubmit={event=>{event.preventDefault();sendMessage(draft);}}><label className="sr-only" htmlFor="message">Your message</label><input id="message" placeholder="Say something charming…" value={draft} onChange={event=>setDraft(event.target.value)} maxLength={500} autoComplete="off"/><button disabled={!draft.trim()} type="submit" aria-label="Send message"><Send size={19}/></button></form><p className="chat-privacy">Messages go nowhere. Refresh to forget everything.</p>
            </motion.section>}</AnimatePresence>
          </div>
          <Dialog open={Boolean(match)} onOpenChange={open=>{if(!open)setMatch(null);}}>
            {match && <DialogPrimitive.Content className="match-overlay" onInteractOutside={event=>event.preventDefault()} aria-describedby="match-description">
              <button className="match-close icon-button" aria-label="Close match" onClick={()=>setMatch(null)}><X size={23}/></button>
              <div className="match-sparkles" aria-hidden="true"><Sparkles size={42}/><span>✦</span><span>✦</span></div>
              <p className="eyebrow">{matchChoice === "plot" ? "YOU'VE ADDED A PLOT TWIST." : "THE FEELING IS MUTUAL. ISH."}</p><DialogTitle className="match-heading">IT'S A<br/><span>MATCH!</span></DialogTitle>
              <DialogDescription className="match-description" id="match-description">{matchChoice === "plot" ? <>Premium imaginary chemistry.<br/>Still no plans.</> : <>Of course it is.<br/>This website loves you.</>}</DialogDescription>
              <div className="match-avatars"><div className="your-avatar"><UserRound size={45}/><span>You</span></div><span className="avatar-heart"><Heart size={22} fill="currentColor"/></span><img src={match.image} alt={match.name}/></div>
              <p className="match-person">You + {match.name}. A beautiful hypothetical.</p>
              <button className="button-primary" onClick={()=>openChat(match)}>Send a message <MessageCircle size={19}/></button><button className="keep-swiping" onClick={()=>setMatch(null)}>Keep swiping <ArrowRight size={16}/></button>
            </DialogPrimitive.Content>}
          </Dialog>
          <div className="home-indicator" aria-hidden="true"/>
        </div>
        <p className="experience-caption">FAKE DATING. <span>REAL DOPAMINE.</span></p>
      </div>
    </section>

    <div className="editorial-strip" aria-hidden="true"><span>ALL THE CHEMISTRY</span><Mark/><span>NONE OF THE CALENDAR INVITES</span><Mark/><span>JUST A LITTLE DELUSION</span><Mark/></div>

    <section className="how-section wrap" id="how-it-works" aria-labelledby="how-title"><div className="section-heading"><p className="eyebrow">THE ART OF NOT MEETING</p><h2 id="how-title">It's going absolutely nowhere.<br/>{" "}<span>You're going to love it.</span></h2></div>
      <div className="how-grid">
        <article className="how-card"><div className="how-card-top"><span className="how-icon"><Layers size={25}/></span><span className="step-number">01 /</span></div><h3>Swipe beautiful<br/>{" "}profiles</h3><p>Choose who catches your eye. The profiles are fictional, but the indecision is real.</p></article>
        <article className="how-card"><div className="how-card-top"><span className="how-icon"><Heart size={25}/></span><span className="step-number">02 /</span></div><h3>Get suspiciously<br/>{" "}good matches</h3><p>Swipe right and your odds are excellent. No algorithms, boosts or subscriptions.</p></article>
        <article className="how-card"><div className="how-card-top"><span className="how-icon"><MessageCircle size={25}/></span><span className="step-number">03 /</span></div><h3>Chat into<br/>{" "}the void</h3><p>Send a message, enjoy the anticipation, then move on. Nobody can ghost you if nobody was ever there.</p></article>
      </div>
    </section>

    <section className="final-section wrap" aria-labelledby="final-title"><div className="final-inner"><span className="final-symbol" aria-hidden="true">✳</span><p className="eyebrow">KEEP YOUR EVENING PLANS. OR DON'T.</p><h2 id="final-title">Zero dates.<br/>{" "}<span>Maximum main-character energy.</span></h2><p>A little flirting. A little fiction. NEVERMEET is an entertainment simulation.<br className="desktop-break"/> No real profiles, no accounts, no actual dates. Just enjoy the plot.</p><button className="button-primary" onClick={startSwiping}>Start swiping <ArrowRight size={20}/></button><span className="final-small">Your sofa is safe.</span></div></section>

    <footer className="site-footer wrap"><div className="footer-top"><a href="#" aria-label="NEVERMEET home"><Wordmark small/></a><p>Made for the plot. Not the plans.</p></div><div className="footer-bottom"><p>NEVERMEET is a fictional dating simulation and is not affiliated with Tinder or any other dating platform.</p><span>© {new Date().getFullYear()} NEVERMEET</span></div><p className="privacy-line">All identities and distances are invented. Portraits are generated or licensed editorial images. Chats stay in this tab, are never transmitted, and disappear on refresh. No analytics or tracking cookies.</p></footer>
  </main>;
}
