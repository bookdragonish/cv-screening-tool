import { Link } from "react-router";
import { FileText, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { useState } from "react";

function Home() {
  const screeningActivities = [
    {
      title: "Senior Developer",
      date: "28 Jan 2026",
    },
    {
      title: "Project Manager",
      date: "25 Jan 2026",
    },
    {
      title: "UX Designer",
      date: "22 Jan 2026",
    },
    {
      title: "Data Analyst",
      date: "20 Jan 2026",
    },
    {
      title: "System Administrator",
      date: "18 Jan 2026",
    },
  ];

  return (
    <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Dashboard header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ color: 'var(--color-dark)' }}>Oversikt</h2>
          <p style={{ color: 'var(--color-dark)' }} className="opacity-75">
            Velkommen tilbake! Her er en oversikt over dine CV-screeningaktiviteter.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - recent activity */}
          <div className="lg:col-span-2">
            <div className="rounded-lg shadow-sm border" style={{ borderColor: 'var(--color-primary)' }}>
              {/* Screening history header */}
              <div className="p-6 border-b" style={{ borderColor: 'var(--color-primary)' }}>
                <h3 className="text-lg font-semibold" style={{ color: 'var(--color-dark)' }}>
                  Nylig screeningaktivitet
                </h3>
                <p className="text-sm mt-1 opacity-75" style={{ color: 'var(--color-dark)' }}>
                  Dine siste CV-screeningresultater
                </p>
              </div>
              {/* Screening activity list */}
              <div className="divide-y" style={{ borderColor: 'var(--color-primary)' }}>
                {screeningActivities.map((activity, index) => (
                  <div
                    key={index}
                    className="p-6 flex items-center justify-between hover:bg-opacity-50 transition-colors"
                    style={{ backgroundColor: 'rgba(0,0,0,0)' }}
                  >
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: 'var(--color-dark)' }}>
                        {activity.title}
                      </h4>
                      <div className="flex items-center gap-1 text-sm opacity-75" style={{ color: 'var(--color-dark)' }}>
                        <Clock className="w-4 h-4" />
                        <span>{activity.date}</span>
                      </div>
                    </div>
                    <Link
                      to="/screening-history"
                      className="font-medium text-sm hover:opacity-75 transition-opacity"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      Se resultater
                    </Link>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t text-center" style={{ borderColor: 'var(--color-primary)' }}>
                <Link
                  to="/screening-history"
                  className="font-medium text-sm inline-flex items-center gap-1 hover:opacity-75 transition-opacity"
                  style={{ color: 'var(--color-primary)' }}
                >
                  Se hele screeninghistorikken →
                </Link>
              </div>
            </div>
          </div>

          {/* Right column - actions */}
          <div className="space-y-6">
            {/* Start new screening card */}
            <Card className="rounded-lg shadow-sm p-6" style={{ backgroundColor: 'var(--color-primary)', borderColor: 'var(--color-primary)' }}>
              <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--color-white)' }}>Start ny screening</h3>
              <p className="text-sm mb-6 opacity-90" style={{ color: 'var(--color-white)' }}>
                Last opp en stillingsbeskrivelse for å matche kandidater fra CV-databasen
              </p>
              <Button
                asChild
                className="w-full font-medium transition-all"
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--color-white)',
                  border: '2px solid var(--color-white)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-white)';
                  e.currentTarget.style.color = 'var(--color-primary)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--color-white)';
                }}
              >
                <Link to="/screening" className="flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" />
                  Start screening
                </Link>
              </Button>
            </Card>

            {/* CV database card */}
            <div className="border rounded-lg shadow-sm p-6" style={{ backgroundColor: 'var(--color-white)', borderColor: 'var(--color-primary)' }}>
              <div className="flex items-start gap-3 mb-4">
                <div className="rounded-lg p-2" style={{ backgroundColor: 'var(--color-light)' }}>
                  <FileText className="w-5 h-5" style={{ color: 'var(--color-dark)' }} />
                </div>
                <div>
                  <h3 className="font-semibold" style={{ color: 'var(--color-dark)' }}>CV-database</h3>
                  <p className="text-sm mt-1 opacity-75" style={{ color: 'var(--color-dark)' }}>68 aktive CVer</p>
                </div>
              </div>
              <Button
                asChild
                variant="outline"
                className="w-full font-medium transition-colors"
                style={{ backgroundColor: 'var(--color-white)', color: 'var(--color-primary)' }}
              >
                <Link to="/cv-database">Administrer CVer</Link>
              </Button>
            </div>
          </div>
        </div>
    </main>
  );
}

export default Home;
