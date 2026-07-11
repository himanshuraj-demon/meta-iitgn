export interface Article {
  slug: string;
  title: string;
  snippet: string;
  content: string; // Markdown format, including frontmatter for the infobox
}

export interface CategoryInfo {
  name: string;
  description: string;
  articles: Article[];
}

export const CATEGORIES_DATA: Record<string, CategoryInfo> = {
  departments: {
    name: "Departments",
    description: "Explore the academic departments and engineering disciplines at IIT Gandhinagar.",
    articles: [],
  },
  faculty: {
    name: "Faculty",
    description: "Learn about the professors, researchers, and their specialized research labs.",
    articles: [],
  },
  courses: {
    name: "Courses",
    description: "Browse course syllabi, prerequisites, grading policies, and recommendations.",
    articles: [],
  },
  research: {
    name: "Research Labs",
    description: "Discover center facilities, instrumentation resources, and active projects.",
    articles: [],
  },
  hostels: {
    name: "Hostels",
    description: "Everything about hostel capacities, mascots, mess dining, and residential guidelines.",
    articles: [],
  },
  facilities: {
    name: "Campus Facilities",
    description: "Details on sports complex, medical center, transport schedules, and shops.",
    articles: [],
  },
  clubs: {
    name: "Student Clubs",
    description: "Get involved in technical, cultural, sports, and social clubs.",
    articles: [],
  },
  fests: {
    name: "Institute Fests",
    description: "Read about Amalthea, Blithchron, Hallabol, and other annual events.",
    articles: [],
  },
  calendar: {
    name: "Academic Calendar",
    description: "Keep track of semesters, mid-sem exams, end-sems, and institute holidays.",
    articles: [],
  },
  policies: {
    name: "Institute Policies",
    description: "Read about graduation criteria, leave policies, and code of conduct guidelines.",
    articles: [],
  },
  placements: {
    name: "Placement Stats",
    description: "Analyze trends, recruiter information, and sector-wise distribution profiles.",
    articles: [],
  },
};
