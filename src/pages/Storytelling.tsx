
import React from "react";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";

const Storytelling = () => {
  return (
    <MainLayout>
      <div className="container max-w-7xl py-10">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-galaxy-star via-galaxy-nova to-galaxy-blue-giant bg-clip-text text-transparent mb-4">
            Historical Storytelling
          </h1>
          <p className="text-xl text-foreground/80 max-w-3xl mx-auto">
            Explore and create immersive historical narratives
          </p>
        </div>

        <Card className="border border-galaxy-nova/30 bg-black/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-galaxy-nova" />
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Our storytelling features are currently under development. Check back soon for interactive historical narratives, timelines, and more.
            </p>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
};

export default Storytelling;
