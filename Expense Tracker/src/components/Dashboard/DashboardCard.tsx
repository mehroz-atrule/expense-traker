import React from 'react'

const DashboardCard = ({color , title , amount } :{color:string , title:string , amount:number}) => {
  return (
           <div className={`bg-gradient-to-br ${color} rounded-xl p-4 text-white shadow-lg`}>
            <div className="text-2xl font-bold">{amount}</div>
            <div className="text-sm opacity-90 mb-1">{title}</div>
          </div>
  )
}

export default DashboardCard
