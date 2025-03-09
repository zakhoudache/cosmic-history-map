
import React from "react";
import { Link } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import CosmicBackground from "@/components/CosmicBackground";
import FeaturesSection from "@/components/FeaturesSection";
import { Network, GanttChart as LucideGanttChart, Youtube } from "lucide-react";

const Index = () => {
  return (
    <MainLayout>
      <div className="relative isolate flex min-h-screen flex-col">
        {/* Hero Section */}
        <div className="relative isolate -z-10">
          <CosmicBackground />
          
          <div className="mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:flex lg:items-center lg:gap-x-10 lg:px-8 lg:py-40">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:flex-auto">
              <div className="flex">
                <div className="relative flex items-center gap-x-4 rounded-full px-4 py-1 text-sm leading-6 text-gray-300 ring-1 ring-gray-700/10 hover:ring-gray-700/20">
                  <span className="font-semibold text-primary">New</span>
                  <span className="h-4 w-px bg-gray-600/20" aria-hidden="true" />
                  <Link to="/youtube" className="flex items-center gap-x-1">
                    <span>Analyze YouTube videos</span>
                    <span aria-hidden="true">&rarr;</span>
                  </Link>
                </div>
              </div>
              <h1 className="mt-10 max-w-lg text-4xl font-bold tracking-tight text-white sm:text-6xl">
                Visualize Historical Connections
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-300">
                Uncover the hidden connections between historical events, people, concepts, and places with ChronoLoom's advanced visualization tools.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <Link
                  to="/visualize"
                  className="cosmic-button px-6 py-3 text-base font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Start Visualizing
                </Link>
                <Link to="/about" className="text-base font-semibold leading-6 text-white">
                  Learn more <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
            <div className="mt-16 sm:mt-24 lg:mt-0 lg:flex-shrink-0 lg:flex-grow">
              <div className="relative mx-auto w-full max-w-lg">
                <img
                  className="absolute -top-10 -right-10 w-[212px] max-w-none"
                  src="/placeholder.svg"
                  alt=""
                />
                <img
                  className="absolute -bottom-20 -left-20 w-[180px] max-w-none"
                  src="/placeholder.svg"
                  alt=""
                />
                <div className="relative mx-auto h-[350px] w-[350px] sm:h-[400px] sm:w-[400px] rounded-full overflow-hidden border-8 border-gray-800/80 glow-sm bg-galaxy-core/30 backdrop-blur-sm">
                  {/* This would be an image or animation showcasing the app */}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <FeaturesSection />

        {/* Demo/Preview section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-base font-semibold leading-7 text-primary">Multiple Visualization Types</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                Different Ways to See Connections
              </p>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Choose from different visualization types to explore historical data in the way that works best for you.
              </p>
            </div>

            <div className="mt-16 sm:mt-20 flex flex-col gap-16">
              {/* Graph Visualization */}
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold tracking-tight">Cosmic Network View</h3>
                  <p className="mt-4 text-base text-muted-foreground">
                    Visualize connections between historical entities as an interactive network graph. Zoom, pan, and explore relationships dynamically.
                  </p>
                  <Link
                    to="/visualize"
                    className="mt-6 inline-flex items-center text-sm font-medium text-primary"
                  >
                    Try Network View <span aria-hidden="true" className="ml-1">→</span>
                  </Link>
                </div>
                <div className="flex-1 aspect-[4/3] overflow-hidden rounded-xl border border-galaxy-nova/30 bg-galaxy-core/10 backdrop-blur-sm">
                  {/* Placeholder for network visualization */}
                  <div className="h-full w-full flex items-center justify-center">
                    <Network size={64} className="text-primary/50" />
                  </div>
                </div>
              </div>

              {/* Timeline Visualization */}
              <div className="flex flex-col-reverse md:flex-row gap-8 items-center">
                <div className="flex-1 aspect-[4/3] overflow-hidden rounded-xl border border-galaxy-nova/30 bg-galaxy-core/10 backdrop-blur-sm">
                  {/* Placeholder for timeline visualization */}
                  <div className="h-full w-full flex items-center justify-center">
                    <LucideGanttChart size={64} className="text-primary/50" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold tracking-tight">Chronological Timeline</h3>
                  <p className="mt-4 text-base text-muted-foreground">
                    See historical entities arranged along a timeline, making it easy to understand chronological relationships and the progression of events.
                  </p>
                  <Link
                    to="/visualize"
                    className="mt-6 inline-flex items-center text-sm font-medium text-primary"
                  >
                    Try Timeline View <span aria-hidden="true" className="ml-1">→</span>
                  </Link>
                </div>
              </div>

              {/* YouTube Analysis Visualization */}
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="flex-1">
                  <h3 className="text-2xl font-bold tracking-tight">YouTube Video Analysis</h3>
                  <p className="mt-4 text-base text-muted-foreground">
                    Extract and analyze transcripts from YouTube videos to discover historical connections and create visualizations from video content.
                  </p>
                  <Link
                    to="/youtube"
                    className="mt-6 inline-flex items-center text-sm font-medium text-primary"
                  >
                    Try YouTube Analysis <span aria-hidden="true" className="ml-1">→</span>
                  </Link>
                </div>
                <div className="flex-1 aspect-[4/3] overflow-hidden rounded-xl border border-galaxy-nova/30 bg-galaxy-core/10 backdrop-blur-sm">
                  {/* Placeholder for YouTube analysis */}
                  <div className="h-full w-full flex items-center justify-center">
                    <Youtube size={64} className="text-primary/50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">Ready to explore history?</h2>
              <p className="mt-6 text-lg leading-8 text-muted-foreground">
                Start analyzing historical texts or YouTube videos to discover connections and visualize them in different ways.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  to="/visualize"
                  className="cosmic-button px-3.5 py-2.5 text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                >
                  Start with Text
                </Link>
                <Link
                  to="/youtube"
                  className="text-sm font-semibold leading-6 inline-flex items-center gap-1"
                >
                  <Youtube className="h-4 w-4" />
                  Analyze a Video <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Index;
