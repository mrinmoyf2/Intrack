"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, FileText, TrendingUp, Clock, LogOut, Plus } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userEmail, setUserEmail] = useState("")
  const router = useRouter()

//   useEffect(() => {
//     const authStatus = localStorage.getItem("isAuthenticated")
//     const email = localStorage.getItem("userEmail")

//     if (authStatus === "true" && email) {
//       setIsAuthenticated(true)
//       setUserEmail(email)
//     } else {
//       router.push("/sign-in")
//     }
//   }, [router])

//   const handleLogout = () => {
//     localStorage.removeItem("isAuthenticated")
//     localStorage.removeItem("userEmail")
//     router.push("/")
//   }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold text-foreground">LeadIntake</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">Welcome, {userEmail}</span>
            {/* <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button> */}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Manage your buyer leads efficiently with powerful tools and insights.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">247</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-accent">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Leads</CardTitle>
              <TrendingUp className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">89</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-accent">+8%</span> from last week
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Converted</CardTitle>
              <FileText className="h-4 w-4 text-secondary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">34</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-secondary">+5%</span> conversion rate
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Follow-up</CardTitle>
              <Clock className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">12</div>
              <p className="text-xs text-muted-foreground">Require immediate attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Quick Actions</CardTitle>
              <CardDescription className="text-muted-foreground">
                Common tasks to manage your leads effectively
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/buyers">
                <Button className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90">
                  <Users className="w-4 h-4 mr-2" />
                  Go to Buyers
                </Button>
              </Link>
              <Button
                variant="outline"
                className="w-full justify-start border-border text-foreground hover:bg-accent/10 bg-transparent"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add New Lead
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-border text-foreground hover:bg-accent/10 bg-transparent"
              >
                <FileText className="w-4 h-4 mr-2" />
                Import CSV
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start border-border text-foreground hover:bg-accent/10 bg-transparent"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardHeader>
              <CardTitle className="text-foreground">Recent Activity</CardTitle>
              <CardDescription className="text-muted-foreground">Latest updates on your leads</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">New lead: Sarah Johnson</p>
                  <p className="text-xs text-muted-foreground">2 minutes ago</p>
                </div>
                <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
                  New
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Follow-up scheduled: Mike Chen</p>
                  <p className="text-xs text-muted-foreground">1 hour ago</p>
                </div>
                <Badge variant="outline" className="border-secondary text-secondary">
                  Scheduled
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">Lead converted: Emma Davis</p>
                  <p className="text-xs text-muted-foreground">3 hours ago</p>
                </div>
                <Badge className="bg-primary text-primary-foreground">Converted</Badge>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-foreground">CSV import completed</p>
                  <p className="text-xs text-muted-foreground">Yesterday</p>
                </div>
                <Badge variant="outline" className="border-accent text-accent">
                  Import
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lead Status Overview */}
        <Card className="border-border bg-card">
          <CardHeader>
            <CardTitle className="text-foreground">Lead Status Overview</CardTitle>
            <CardDescription className="text-muted-foreground">
              Current distribution of your leads by status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-primary/5 border border-primary/10">
                <div className="text-2xl font-bold text-primary mb-1">89</div>
                <div className="text-sm text-muted-foreground">New Leads</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-accent/5 border border-accent/10">
                <div className="text-2xl font-bold text-accent mb-1">67</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-secondary/5 border border-secondary/10">
                <div className="text-2xl font-bold text-secondary mb-1">34</div>
                <div className="text-sm text-muted-foreground">Qualified</div>
              </div>
              <div className="text-center p-4 rounded-lg bg-muted/50 border border-border">
                <div className="text-2xl font-bold text-muted-foreground mb-1">57</div>
                <div className="text-sm text-muted-foreground">Closed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
