# MUDPY WEBAPPLICATION

## Installation/Deployment

### Prerequisites

- A linux host with cgroups v1 enabled (this is due to [snekbox](https://github.com/python-discord/snekbox) upstream not having switched to v2, [it is however being worked on.](https://github.com/python-discord/snekbox/pull/127)). Cgroups v1 can be enabled on a machine if the default is v2 by [setting a kernel parameter.](https://wiki.archlinux.org/title/Cgroups#Enable_cgroup_v1)
- docker
- docker-compose

### Setup

1. Clone the repository
2. Adjust nginx port in docker-compose.yml file (defaults is 80)
3. Run with `docker-compose up -d`. This will build the mudpy image and then run it alongside all other required containers.

## Usage
![4eccb72e5b90b5097fd86fd755eb236a](https://github.zhaw.ch/storage/user/2958/files/ac8fc31d-1cab-445b-8da1-9570cec5bae7)  
The app frontend is divided into 4 parts.

### Components
#### Codeeditor
![4eccb72e5b90b5097fd86fd755eb23dads6a](https://github.zhaw.ch/storage/user/2958/files/783703e1-383a-46cd-a849-dff31952e73f)  
Your code to solve puzzles goes here.  
The clear button can be used to clear the editor content and the submit button to submit code for evaluation.

#### Terminal
![e5c61f3855de137b1d12404caa98f32e](https://github.zhaw.ch/storage/user/2958/files/9c1dff8a-2c57-43c3-824e-1af45f7afaf7)  
The Terminal is the core of the application and we navigate the game with help of it.

##### Commands
![4a153ce949b89b64f2babdf2858661f8](https://github.zhaw.ch/storage/user/2958/files/f529e87a-5101-41eb-86e1-a30d9e8acf01)  
When we type help in terminal we can get the overview of available commands.

#### Map
![6f4224f0d879102d9635d8dfacffd55f](https://github.zhaw.ch/storage/user/2958/files/f3628ee3-6ea5-4bfa-82b4-ee7aa5f9a628)  
On the map we can see where we are currently, which rooms are where and which we completed, keys located in rooms and locked rooms.

#### Information
![8d07630cb15302e930cc4a3d1adc31fa](https://github.zhaw.ch/storage/user/2958/files/705bc71d-9745-4b64-bea9-20906d502cda)  
Here we can see our score, how many characters are in our room and our current task.
