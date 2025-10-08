
interface Expense {
  id: string | number;
  title: string;
  date: string | Date;
  amount: number;
  status: string;
}

const ExpenseCard = ({exp}: {exp: Expense}) => {
  return (
<div key={exp.id} className="px-2 py-4  bg-white duration-150 mb-2 shadow-sm rounded-md ">
                <div className="flex justify-between items-center">
                  <div className="flex flex-col items-start px-2 gap-2 ">
                    <div className="font-semibold text-gray-800 text-lg">{exp.title}</div>
                    <div className="text-sm text-gray-500 mt-1">{new Date(exp.date).toLocaleDateString()}</div>
                  </div>
                  <div className="flex flex-col px-2  items-end gap-4">
                    <div className="font-bold text-gray-800 text-lg">Rs. {exp.amount}</div>
                    <div className="text-sm text-gray-600">{exp.status}</div>
                  </div>
                </div>    
              </div>  )
}

export default  ExpenseCard         