import userRouting from "./User";
import companyOrganisation from "./company.routing";
import tokenRouting from "./token/token.routing";
import projectRouting from "./project";
import testimonialRouting from "./testimonial";
import videosRouting from "./video";
import notesRouting from "./notes";
import classRouting from "./class";
import examRouting from "./exam";
import quizRouting from "./quiz";
import blogRouting from "./blog/blog";
import StudentRouting from "./userTypes/student";
import expenseRouting from "./expense.routing";
import TripRouting from "./trips/trip.routing";
import UserRouting from "./users.routing";
import departmentRouting from "./department.routing";
import requestRouting from "./request.routing";
import attendencRequestRouting from "./attendenceRequest.routing";
import LiberaryManagementRouting from './liberary/liberary.routing'
import OrderRouting from './order/order.routing'
import WebTemplateRouting from './webTemplate/webTemplate.routing'
import Roster from './roster.routing';
import Attendence from './attendence.routing';

const importRoutings = (app: any) => {
  app.use("/api/auth", userRouting);
  app.use("/api/company", companyOrganisation);
  app.use("/api/User", UserRouting);
  app.use('/api/token',tokenRouting)
  app.use("/api/project", projectRouting);
  app.use("/api/testimonial", testimonialRouting);
  app.use("/api/videos", videosRouting);
  app.use("/api/notes", notesRouting);
  app.use("/api/class", classRouting);
  app.use("/api/exam", examRouting);
  app.use("/api/quiz", quizRouting);
  app.use("/api/blog", blogRouting);
  app.use("/api/student", StudentRouting);
  app.use("/api/expense", expenseRouting);
  app.use("/api/trip", TripRouting);
  app.use("/api/department", departmentRouting);
  app.use("/api/request", requestRouting);
  app.use("/api/attendenceRequest", attendencRequestRouting);
  app.use('/api/liberary',LiberaryManagementRouting)
  app.use('/api/order',OrderRouting)
  app.use('/api/webTemplate', WebTemplateRouting);
  app.use('/api/roster',Roster);
  app.use('/api/attendence',Attendence);
};

export default importRoutings;