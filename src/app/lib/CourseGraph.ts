// Graph with only core SE classes. No tech electives. Starting small, gonna add more assuming this method works

class CourseGraph {
    private graph: { [key: string]: string[] };
    private inDegree: { [key: string]: number };

    constructor() {
        this.graph = {};      // Adjacency list representation of the graph
        this.inDegree = {};   // Tracks number of prerequisites for each course
    }

    addCourse(course: string, prerequisites: string[]): void {
        if (!this.graph[course]) this.graph[course] = [];
        if (!this.inDegree[course]) this.inDegree[course] = 0;

        prerequisites.forEach(pre => {
            if (!this.graph[pre]) this.graph[pre] = [];
            this.graph[pre].push(course);
            this.inDegree[course] = (this.inDegree[course] || 0) + 1;
        });
    }

    getAvailableCourses(completedCourses: string[]): string[] {
        let queue = [...completedCourses];
        let available = new Set<string>();

        while (queue.length > 0) {
            let course = queue.shift()!;

            if (this.graph[course]) {
                this.graph[course].forEach(nextCourse => {
                    this.inDegree[nextCourse] -= 1;
                    if (this.inDegree[nextCourse] === 0) {
                        available.add(nextCourse);
                    }
                });
            }
        }

        return Array.from(available);
    }
}

// Initialize graph
const courseGraph = new CourseGraph();

// Default Courses
// Semester 1
courseGraph.addCourse("CSE 1284", []); // Intro to Computer Programming
courseGraph.addCourse("CSE 1011", []); // Intro to CSE

// Semester 2 
courseGraph.addCourse("CSE 1384", ["CSE 1284"]); // Intermediate Programming
courseGraph.addCourse("CSE 2813", ["CSE 1284"]); // Discrete Structures

// Semester 3
courseGraph.addCourse("CSE 2383", ["CSE 1384"]); // Data Structures
courseGraph.addCourse("CSE 2213", ["CSE 1384"]); // Methods & Tools

// Semester 4
courseGraph.addCourse("CSE 3183", ["CSE 2383"]); // Systems Programming
courseGraph.addCourse("CSE 3724", ["CSE 1384", "CSE 2383"]); // Computer Organization

// Semester 5
courseGraph.addCourse("CSE 4733", ["CSE 3183", "CSE 3724"]); // Operating Systems 1
courseGraph.addCourse("CSE 4214", ["CSE 2383"]); // Intro to SE

// Semester 6
courseGraph.addCourse("CSE 4283", ["CSE 4214"]); // SW Test & QA
courseGraph.addCourse("CSE 4833", ["CSE 2383", "CSE 2813"]); // Intro to Algorithms

// Semester 7
courseGraph.addCourse("CSE 4233", ["CSE 4214"]); // Software Arch & Design
courseGraph.addCourse("CSE 3213", ["CSE 4214"]); // SE Senior Project 1
courseGraph.addCourse("CSE 4223", ["CSE 4214"]); // Manage SW Project

// Semester 8
courseGraph.addCourse("CSE 3763", []); // Legal and Ethical Issues
courseGraph.addCourse("CSE 3223", ["CSE 4214"]); // SE Senior Project 2


// Example usage
const completed = ["CSE 1284", "CSE 1384", "CSE 2383"];
console.log("Available Courses:", courseGraph.getAvailableCourses(completed));
