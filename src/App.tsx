import { lazy, Suspense, useEffect } from "react";
import { HashRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppNav } from "./components/AppNav";
import { PwaNotice } from "./components/PwaNotice";
import { RouteTransition } from "./components/RouteTransition";
import { PwaStateProvider } from "./pwa/PwaState";
import { AppStateProvider } from "./state/AppState";

const scrollPositions = new Map<string, number>();

const LearnPage = lazy(() => import("./pages/LearnPage").then((module) => ({ default: module.LearnPage })));
const ProgressPage = lazy(() => import("./pages/ProgressPage").then((module) => ({ default: module.ProgressPage })));
const QuizPage = lazy(() => import("./pages/QuizPage").then((module) => ({ default: module.QuizPage })));
const ResultsPage = lazy(() => import("./pages/ResultsPage").then((module) => ({ default: module.ResultsPage })));
const SettingsPage = lazy(() => import("./pages/SettingsPage").then((module) => ({ default: module.SettingsPage })));
const PhraseKitPage = lazy(() => import("./pages/PhraseKitPage").then((module) => ({ default: module.PhraseKitPage })));
const TopicPage = lazy(() => import("./pages/TopicPage").then((module) => ({ default: module.TopicPage })));
const TopicsPage = lazy(() => import("./pages/TopicsPage").then((module) => ({ default: module.TopicsPage })));
const VocabularyStudyPage = lazy(() => import("./pages/VocabularyStudyPage").then((module) => ({ default: module.VocabularyStudyPage })));

function AppFrame() {
  const location = useLocation();
  const focusedFlow = location.pathname.includes("/quiz/") || location.pathname.includes("/study") || location.pathname.startsWith("/results/");

  useEffect(() => {
    const path = location.pathname;
    const frame = requestAnimationFrame(() => window.scrollTo({ top: scrollPositions.get(path) ?? 0 }));
    return () => {
      cancelAnimationFrame(frame);
      scrollPositions.set(path, window.scrollY);
    };
  }, [location.pathname]);

  return (
    <div className={focusedFlow ? "app app--focused" : "app"}>
      <a className="skip-link" href="#main-content">Skip to content</a>
      {!focusedFlow ? <AppNav /> : null}
      <PwaNotice />
      <div id="main-content" className="app-main">
        <Suspense fallback={<div className="page route-loading" role="status"><span className="spinner" /> Opening…</div>}>
          <RouteTransition routeKey={location.pathname}>
          <Routes location={location}>
            <Route path="/" element={<Navigate to="/learn" replace />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/topics" element={<TopicsPage />} />
            <Route path="/phrases" element={<PhraseKitPage />} />
            <Route path="/topic/:topicId" element={<TopicPage />} />
            <Route path="/topic/:topicId/scene/:sceneId" element={<TopicPage />} />
            <Route path="/topic/:topicId/study" element={<VocabularyStudyPage />} />
            <Route path="/topic/:topicId/quiz/:tier" element={<QuizPage />} />
            <Route path="/results/:sessionId" element={<ResultsPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/learn" replace />} />
          </Routes>
          </RouteTransition>
        </Suspense>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AppStateProvider>
      <PwaStateProvider>
        <HashRouter>
          <AppFrame />
        </HashRouter>
      </PwaStateProvider>
    </AppStateProvider>
  );
}
