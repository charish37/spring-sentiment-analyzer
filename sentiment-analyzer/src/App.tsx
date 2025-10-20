import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Loader2, Sparkles, MessageSquarePlus } from "lucide-react";

export type SentimentType = "POSITIVE" | "NEGATIVE" | "NEUTRAL";
export interface FeedbackItem {
  id?: number;
  content: string;
  sentimentScore: number;
  sentimentType: SentimentType;
  modelResponse?: string; 
  createdAt?: string;
}

const toPct = (score: number) => Math.round(((score + 1) / 2) * 100);

const chipStyles: Record<SentimentType, { badge: string; ring: string }> = {
  POSITIVE: { badge: "bg-green-600 text-white", ring: "ring-green-200" },
  NEGATIVE: { badge: "bg-red-600 text-white", ring: "ring-red-200" },
  NEUTRAL: { badge: "bg-gray-600 text-white", ring: "ring-gray-300" },
};

const API = axios.create({ baseURL: "http://localhost:8080" });

export default function SentimentPortfolio() {
  const [text, setText] = useState("");
  const [items, setItems] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await API.get<FeedbackItem[]>("/api/feedback");
        setItems(res.data);
      } catch (e) {
        setError("Failed to load history. Is the backend running on :8080?");
      }
    })();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await API.post<FeedbackItem>("/api/feedback", text, {
        headers: { "Content-Type": "text/plain" },
      });
      setItems((prev) => [...prev, res.data]);
      setText("");
    } catch (e) {
      setError("Submit failed. Check server logs.");
    } finally {
      setLoading(false);
    }
  };

  const sorted = useMemo(
    () => [...items].sort((a, b) => (a.id ?? 0) - (b.id ?? 0)),
    [items]
  );

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="text-3xl font-bold tracking-tight mb-4">Sentiment Analyzer</h1>
     
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquarePlus className="h-5 w-5" /> New Feedback
          </CardTitle>
          <CardDescription>Type feedback and submit to analyze.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="e.g. The app is great, but the login is slow and confusing on mobile."
          />
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </CardContent>
        <CardFooter className="flex items-center gap-3">
          <Button onClick={onSubmit} disabled={loading}>
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing…</>
            ) : (
              <>Analyze</>
            )}
          </Button>
          <Button variant="outline" onClick={() => setText("")}>Clear</Button>
        </CardFooter>
      </Card>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Feedback History</h2>
        <span className="text-sm text-muted-foreground">{sorted.length} items</span>
      </div>

      {sorted.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-sm text-muted-foreground">
            No feedback yet. Submit your first analysis above.
          </CardContent>
        </Card>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {sorted.map((f) => (
            <li key={f.id ?? Math.random()}>
              <FeedbackCard item={f} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function FeedbackCard({ item }: { item: FeedbackItem }) {
  const pct = toPct(item.sentimentScore);
  const style = chipStyles[item.sentimentType];
  const scoreLabel = `${item.sentimentScore.toFixed(2)} (${pct}%)`;

  return (
    <Card className={`h-full transition-shadow hover:shadow-md ring-1 ${style.ring}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Sentiment</CardTitle>
          <Badge className={style.badge}>{item.sentimentType}</Badge>
        </div>
        <CardDescription>Model confidence mapped to −1..1 → 0..100%</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="mb-1 flex items-center justify-between text-sm">
            <span>Score</span>
            <span className="font-mono">{scoreLabel}</span>
          </div>
          <Progress value={pct} />
        </div>
        <Separator />
        <div>
          <div className="mb-1 text-xs uppercase tracking-wide text-muted-foreground">Feedback</div>
          <p className="whitespace-pre-wrap text-sm">{item.content}</p>
        </div>
        {item.modelResponse && (
          <div className="rounded-lg border bg-card p-3">
            <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5" /> Suggested reply
            </div>
            <blockquote className="text-sm leading-relaxed">{item.modelResponse}</blockquote>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
