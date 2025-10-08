
const PendingCard = () => {
  return (
     <div className="mb-4 mt-6">

            <h2 className="max-sm:text-ms font-medium text-gray-800 mb-6">Pending Approval</h2>
          <div className="gap-4 bg-white rounded-lg shadow-sm  p-4">
            <div className=" flex text-center items-center  gap-4 ">
              <div className="text-3xl font-bold bg-blue-600 p-3 rounded-xl text-white">10</div>
              <div className="text-gray-600 font-medium">Expense</div>
            </div>
          </div>
        </div>
  )
}

export default PendingCard