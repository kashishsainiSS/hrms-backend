import EventExpense from "../schemas/ProgramExpense/ProgrameExpense";

export const createEventExpense = async (data : any) => {
    try
    {
        const expense = new EventExpense(data)
        const savedExpense = await expense.save()
        return {
            status : 'success',
            data : savedExpense
        }
    }
    catch(err)
    {
        return {
            status : 'error',
            data : err
        }
    }
}

export const updateEventExpense = async (data : any) => {
    try
    {
        const updatedExpense = await EventExpense.findByIdAndUpdate(data.id, {$set : data},{new : true})
        if(updatedExpense){
            return {
                status : 'success',
                data : updatedExpense
            }
        }
        else {
            return {
                status : 'error',
                data : 'Expense Record does not exists'
            }
        }
    }
    catch(err)
    {
        return {
            status : 'error',
            data : err
        }
    }
}

export const getSingleEventExpense = async (id : any) => {
    try
    {
        const expenseData = await EventExpense.findById(id)
        if(expenseData){
            return {
                status : 'success',
                data : expenseData
            }
        }
        else{
            return {
                status : 'error',
                data : 'Expense Record does not exists'
            }
        }
    }
    catch(err)
    {
        return {
            status : 'error',
            data : err
        }
    }
}

export const getAllEventExpense = async (data : any) => {
    try
    {
        const data = await EventExpense.find()
        return {
            status : 'success',
            data : data
        }
    }
    catch(err)
    {
        return {
            status : 'error',
            data : err
        }
    }
}