# PRIORA &mdash; 3–5 Minute Hackathon Presentation Demo Script

**Target Time**: 3 to 4.5 minutes  
**Presenter Roles**: Management Persona (Sarah Chen) & Employee Persona (Rahul Sharma)  
**Live Demo URL**: Local (`http://localhost:5173`) or Vercel Deployment

---

## Script & Action Choreography

### [0:00 - 0:35] Introduction: The Problem
> **Presenter (to judges):**  
> *"Judges, modern enterprise teams suffer from two connected problems: employees spend excessive mental energy every morning guessing what to work on next, while managers discover critical bottlenecks weeks too late. Today we are presenting **PRIORA &mdash; Intelligent Work Orchestration**."*

---

### [0:35 - 1:30] Management View: Early Problem Detection
- **Step 1**: Open PRIORA login screen.
- **Step 2**: Click **Sarah Chen (VP Operations)** on the 1-click Demo Card.
- **Step 3**: Point to the **Team Health** widget:
  > *"As a manager, Sarah's first question is 'Where does attention need to go?'. Look at our 5 teams: Product Engineering, Data & AI, and Design are healthy green. But Operations is flagged as 🟠 Needs Attention."*
- **Step 4**: Highlight the numbers:
  > *"Operations expected 82% progress, but actual velocity is 68% &mdash; a 14 percentage point delta."*
- **Step 5**: Click **Operations** to open the team drill-down.
- **Step 6**: Show the operational signals:
  > *"PRIORA immediately surfaces the contributing signals: 3 delayed tasks, 1 blocked employee, and 2 unresolved upstream vendor dependencies."*
- **Step 7**: Highlight the root cause bottleneck:
  > *"Notice that one specific deliverable &mdash; 'Resolve Payment API Integration' &mdash; is blocking 3 critical downstream tasks: API Testing, Reconciliation, and the Production Release."*

---

### [1:30 - 2:45] Employee View: The Flagship Next Best Action
- **Step 8**: In the top navigation bar, click **Switch Role: Rahul Sharma (Employee)**.
- **Step 9**: The page transitions to `/employee/dashboard`:
  > *"Now we are in Rahul's shoes. In Jira or Asana, Rahul would see 10 unranked tasks. He wouldn't know which one matters most."*
- **Step 10**: Point to the flagship **NEXT BEST ACTION** card:
  > *"In PRIORA, Task #6 was automatically promoted to Rank #1 as the Next Best Action. Rahul doesn't have to think about what to do next."*
- **Step 11**: Click **View reasoning** under *Why this task?*:
  > *"Why? Because it has critical business impact, is due today by 5:00 PM, blocks 3 downstream team members, and was flagged as Sarah's top priority."*
- **Step 12**: Click **START TASK**:
  > *"Rahul begins execution with one click. The system records the start event and validates priority adherence."*
- **Step 13**: Simulate an operational blocker &mdash; click **Mark Blocked**:
  - Select *External dependency*.
  - Keep reason: *"Vendor sandbox API key is throwing rate-limit errors."*
  - Check *"Request Support"* and click **Request Support**.
  - Show Rahul's status turning to **🟠 Needs Attention**.

---

### [2:45 - 3:45] The Closed Feedback Loop: Support & Reprioritization
- **Step 14**: In the top navigation, click **Switch Role: Sarah Chen (Manager)**.
- **Step 15**: Point to the **Attention Center**:
  > *"Immediately on the management dashboard, a new alert appears: 'Task Blocked: Resolve Payment API Integration &bull; Support Requested by Rahul Sharma'."*
- **Step 16**: Show Rahul's badge in the **Employee Operations Matrix**:
  > *"Rahul's signal shows 🟠 Needs Attention with 1 blocked item."*
- **Step 17**: Click **AI Assistant** in the top navigation:
  - Click the quick prompt: *"Why is Operations behind?"*
  - Show the response generated in real time from live database telemetry.
- **Step 18**: Demonstrate Manager Override / Task Unblocking:
  - Navigate to **Tasks & Overrides**.
  - Click **Override Rank** on another urgent item and promote it to Rank #1 with reason: *"Executive directive"*.
- **Step 19**: Switch back to Rahul:
  - Show the **MANAGER PRIORITY OVERRIDE** badge immediately updated on the Next Best Action card, with the rest of the queue smoothly reprioritized.

---

### [3:45 - 4:15] Conclusion & Judging Impact
- **Step 20**: Conclude on the core orchestration loop:
  > *"In less than 4 minutes, you have seen PRIORA's continuous orchestration loop in action:*  
  > ***PLAN &rarr; PRIORITIZE &rarr; EXECUTE &rarr; DETECT &rarr; SUPPORT &rarr; REPRIORITIZE***.  
  > *Employees stop wasting mental energy deciding what to do next, and managers stop discovering execution failures after they become critical. Thank you!"*
