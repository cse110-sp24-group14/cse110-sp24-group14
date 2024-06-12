# Team 14

[Private video](https://youtu.be/KRZFOjeSvd4)

[Public video](https://youtu.be/m8A1SdFYKyE)

## About This Project

We are Team 14, Bozosort. We are striving to create the best developer-focused journal, primarily catered towards students like us. Among our features we have an agenda, code snippets, and more. Make sure to visit out website everyday and try to get the highest streak!


## Downloading the Project

Dependencies: 
- Node
- Docker

Clone repository

```
git clone https://github.com/cse110-sp24-group14/cse110-sp24-group14.git
```

Move into source code folder

```
cd cse110-sp24-group14/source
```

Install node dependecies

```
npm install
```

Initialize database 

```
bash db-init.sh <container name>
```

Start localhost

```
node server.js
```
<hr>

Deleting the database

```
bash db-remove.sh <container name>
```

## CI Pipeline

We have a continuous integration pipeline that runs via GitHub actions in our `staging` and `main branches` we have a eslint that enforces linting and various tests with sqlite, puppeteer, and jest. We also utilize JSDocs, which builds all of our documentation to [https://cse110-sp24-group14.github.io/cse110-sp24-group14/](https://cse110-sp24-group14.github.io/cse110-sp24-group14/). 

## Resources

- [Figma design board](https://www.figma.com/design/zNVxTEwExahDGpp1mrBVRq/CSE-110-To-do-List)
- [Database schema](https://github.com/cse110-sp24-group14/cse110-sp24-group14/blob/main/specs/adr/052124-db-schema.md)
