const { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLFloat, GraphQLID, GraphQLList } = require('graphql');
// const pg = require('pg');
const pool = require('./connection');

  
//   console.log(conn.port)



// Creating a Graphql object with the desired entities
const EmployeeType = new GraphQLObjectType({
  name: 'Employees',
  fields: {
    id: { type: GraphQLID },
    emp_name: { type: GraphQLString },
    job:{type: GraphQLString},
    department: { type: GraphQLString },
    salary: { type: GraphQLFloat },
    hire_date: { type: GraphQLString },
  },
});

//query for getting all employees or getting employee against id
const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      employee: {
        type: EmployeeType,
        args: { id: { type: GraphQLID } },
        resolve(parent, args) {
          return pool.query('SELECT * FROM Employees WHERE id = $1', [args.id])
            .then((result) => {
              if (result.rowCount === 0) {
                throw new Error('Employee not found');
              }
              return result.rows[0];
            })
            .catch(err => {
              console.error(err);
              throw new Error('Database error');
            });
        },
      },
      employees: {
        type: new GraphQLList(EmployeeType),
        resolve() {
          return pool.query('SELECT * FROM Employees')
            .then((result) => result.rows)
            .catch(err => {
              console.error(err);
              throw new Error('Database error');
            });
        },
      },
    },
  });

  //Mutation for update and delte
  const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
      updateEmployee: {
        type: EmployeeType,
        args: {
        id:{type:GraphQLID},
          name: { type: GraphQLString },
          job: { type: GraphQLString },
          department: { type: GraphQLString },
          salary: { type: GraphQLFloat },
          hire_date: { type: GraphQLString },
        },
        resolve(parent, args) {
          const { name, job, department, salary, hire_date } = args;
          return pool.query(
            'Update Employees set emp_name=$2,job=$3, department=$4, salary=$5, hire_date=$6 where id = $1 RETURNING *',
            [args.id,args.name,args.job, args.department, args.salary, args.hire_date]
          ).then((result) => result.rows[0]);
        },
      },
      
    addEmployee:{
        type:EmployeeType,
        args: {
                  name: { type: GraphQLString },
                  job: { type: GraphQLString },
                  department: { type: GraphQLString },
                  salary: { type: GraphQLFloat },
                  hire_date: { type: GraphQLString },
                },
        resolve(parent,args){
            return pool.query('Insert into Employees (emp_name,job,department,salary,hire_date) Values($1,$2,$3,$4,$5) RETURNING *',
            [args.name,args.job,args.department,args.salary,args.hire_date])
        }

    },
      deleteEmployee: {
        type: EmployeeType,
        args: { id: { type: GraphQLID } },
        resolve(parent, args) {
          return pool.query('DELETE FROM Employees WHERE id = $1 RETURNING *', [args.id])
            .then((result) => result.rows[0]);
        },
      },
    },
  });




module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation:Mutation
 
});
