
# BusWatch

 BusWatch is a bus attendance management system designed for colleges. 
 It allows watchmen to log bus arrival times through a user-friendly interface, notifying professors if a bus is late via email. The system ensures efficient communication and timely updates without unnecessary alerts for on-time buses. 🚍📡


## Features

- Real-Time Bus Tracking – Logs and displays live arrival times.
- Late Arrival Notifications – Sends WhatsApp/SMS alerts to professors for late buses.
- User-Friendly Interface – Simple dropdown for watchmen to select and update bus status.
- Automated System – No notifications for on-time buses, reducing unnecessary alerts.
- Efficient Communication – Ensures professors stay informed about delays without manual follow-ups.



## Tech Stack

**Client:** ReactJs, TailwindCSS

**Server:** Node, Express

**Database:** MongoDB


## Demo Video
https://drive.google.com/file/d/1ookbM7bEt2YEhkEH7CpLtVkrlyECrnyz/view?usp=sharing
<a href="https://drive.google.com/file/d/1ookbM7bEt2YEhkEH7CpLtVkrlyECrnyz/view?usp=sharing" target="_blank" rel="noopener noreferrer">Watch the Demo Video</a>


## Screenshots
**SignUp:** 
Users have to sign up as either an Admin or a Guard. After signing up, they will receive an OTP on their registered email for authentication. Following this step, new users can set their passwords.

![image](https://github.com/user-attachments/assets/bd8cc942-4f74-4809-a20b-245a52d9e2a4)



**Login:**
Upon each user login using their email and password credentials, a JSON Web Token (JWT) is generated and issued to facilitate authentication.

![image](https://github.com/user-attachments/assets/b91e7008-0840-4ae2-a1b2-419e27d2a4b8)



**Admin Dashboard View:**
After an Admin logs in, they gain access to a feature where past attendance sessions of the buses are displayed. By clicking on these sessions, the Admin can view detailed information about each bus. Additionally, there is a functionality provided for the Admin to create new attendance sessions for new buses.

![image](https://github.com/user-attachments/assets/5ddcc600-8a2e-45bf-ba5c-2a2491291abd)



**Create New Session:**
Admin can create a new session by clicking on 'Create Record' button. They can set the Bus Number, Location, Time, and the Distance Parameter for Bus Attendance. The Distance Parameter is the maximum distance a Bus can be from the Admin location to be marked as present.

![image](https://github.com/user-attachments/assets/09662055-e614-4424-b039-8aefb4757edb)



**QR Code Generated:**
For each bus session created, a unique QR code is generated. This QR code is to be scanned by guards to mark the attendance. The QR code is displayed on the Admin's screen during the session. This can be viewed by the Admin by clicking on the session in the dashboard.

![image](https://github.com/user-attachments/assets/bcb9afbb-60f3-458b-8bca-83260c7d84a1)



**Admin Dashboard after creating a session:**
New Session is Created

![image](https://github.com/user-attachments/assets/f280c1ff-55a1-4a43-bd37-860b330c2950)



**Guard Dashboard View:**
After a Guard logs in, they can view the attendance history.

![image](https://github.com/user-attachments/assets/4a5fbd81-d53d-4d9d-a89f-0aada16d7491)



**Submit Attendance:**
Guards can submit the attendance by scanning the QR code displayed by the Admin during the session. They have to enter the Bus Number and capture a photo. The system will then mark the Bus as present or absent based on the distance parameter set by the Admin.

![image](https://github.com/user-attachments/assets/36819b0d-91f7-4914-a691-ccfe7bb9da76)



**Attendance Given:**
Attendance is successfully submitted.

![image](https://github.com/user-attachments/assets/ce1db3dc-6407-43a8-9c6e-d66f4ee2fd3c)



**Guard Dashboard view after submitting attendance:**
Attendance is successfully submitted.

![image](https://github.com/user-attachments/assets/436c820b-51b1-4da8-87d4-320bca5bffc3)



**Session Info in Admin Dashboard:**
Upon clicking on a past session, the system presents detailed session information including a QR code, a list of daily bus records along with the captured photos taken during attendance registration, and their respective distances from the Admin location. If the guard's distance exceeds the parameter set by the Admin, it will be displayed in red; otherwise, it will be shown in green.

![image](https://github.com/user-attachments/assets/57048805-df49-4274-ac45-968e61f5ce81)



**Bus late mail:**
Faculty of the students who are in the late bus will get a message through email stating the bus is late.

![image](https://github.com/user-attachments/assets/5bce776f-d5f3-4612-975e-43c8f5dcd721)



**Forgot Password:**
Users can reset their passwords by clicking on the 'Forgot Password' link on the login page. They will receive an OTP on their registered email for authentication. Following this step, users can set their new passwords.

![image](https://github.com/user-attachments/assets/22a8b9b4-dad8-47dd-b9ee-697ce8f0c3bb)














