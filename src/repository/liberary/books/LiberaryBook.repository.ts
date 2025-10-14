import { createCatchError, generateFileName } from "../../../config/helper/function";
import { statusCode } from "../../../config/helper/statusCode";
import LibraryBook from "../../../schemas/Liberary/books/LiberaryBooks.schema";
import { deleteFile, uploadFile } from "../../uploadDoc.repository";

export const createBook = async (data: any) => {
  try {
    const {coverImage, ...rest} = data
    const bookData = new LibraryBook(rest);
    const savedBookData = await bookData.save()

    if(data.coverImage && data.coverImage?.buffer && data.coverImage?.filename && data.coverImage?.isAdd){
      data.coverImage.filename = generateFileName(data.coverImage.filename)
      const uploadedData = await uploadFile({...data.coverImage})
      savedBookData.coverImage = {
        name : data.coverImage.filename,
        url : uploadedData,
        type : data.coverImage.type
      }
      await savedBookData.save()
    }

    return {
      status: "success",
      data: savedBookData,
      message: "Book has been created successfully",
      statusCode: statusCode.success,
    };
  } catch (err :any) {
    return createCatchError(err);
  }
};

export const getSingleBookById = async(data : any) => {
  try {
    const book = await LibraryBook.findById(data.id).populate('categories');
    if (book) {
      return {
        statusCode: statusCode.success,
        status: "success",
        data: book,
        message: "Retrived book Successfully",
      };
    } else {
      return {
        statusCode: statusCode.info,
        status: "error",
        data: "Book does not exists",
        message: "Book does not exists",
      };
    }
  } catch (err: any) {
    return createCatchError(err);
  }
}

export const findOneBook = async (data: any) => {
  try {
    const book = await LibraryBook.findOne(data);
    if (book) {
      return {
        statusCode: statusCode.success,
        status: "success",
        data: book,
        message: "Retrived book Successfully",
      };
    } else {
      return {
        statusCode: statusCode.info,
        status: "error",
        data: "Book does not exists",
        message: "Book does not exists",
      };
    }
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const getAllBooks = async (data: any) => {
  try {
    const { company, page = 1, limit = 10 } = data;

    const skip = (page - 1) * limit;

    let pipeline: any[] = [];

    pipeline.push({
      $match: {
        company: {$in : company},
        deletedAt: { $exists: false }
      }
    });

    const totalBooksPipeline = [...pipeline, { $count: "total" }];
    const totalBooksResult = await LibraryBook.aggregate(totalBooksPipeline);
    const totalBooks = totalBooksResult.length > 0 ? totalBooksResult[0].total : 0;

    const totalPages = Math.ceil(totalBooks / limit);

    pipeline.push({
      $sort: {
        createdAt: -1,
      },
    });

    pipeline.push({
      $skip: skip
    });

    pipeline.push({
      $limit: limit
    });

    const result = await LibraryBook.aggregate(pipeline);
    return {
      status: 'success',
      data: {data : result, totalPages : totalPages},
      message: 'Books retrieved successfully',
      statusCode: statusCode.success
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const updateBook = async (data: any) => {
  try {
    const { status } = await findOneBook({
      _id: data.id,
      company: data.company,
      deletedAt: { $exists: false },
    });
    if (status === "success") {
      const {coverImage,...rest} = data
      const liberaryBookData : any = await LibraryBook.findByIdAndUpdate(
        data.id,
        { $set: rest },
        { new: true , upsert : false}
      );

      if(liberaryBookData?.coverImage?.name && data?.coverImage?.isDeleted)
      {
          await deleteFile(
            liberaryBookData?.coverImage.name
          );
          liberaryBookData.coverImage = {
            name: undefined,
            url: undefined,
            type: undefined,
          };
          await liberaryBookData.save()
      }

      if(coverImage && coverImage?.buffer && coverImage?.filename && coverImage?.isAdd){
        coverImage.filename = generateFileName(coverImage.filename)
        const uploadedData = await uploadFile({...coverImage})
        liberaryBookData.coverImage = {
          name : coverImage.filename,
          url : uploadedData,
          type : coverImage.type
        }
        await liberaryBookData.save()
      }

      return {
        status: "success",
        data: liberaryBookData,
        message: "Book has been updated successfully",
        statusCode: statusCode.success,
      };
    } else {
      return {
        statusCode: statusCode.info,
        status: "error",
        data: "Book does not exists",
        message: "Book does not exists",
      };
    }
  } catch (err: any) {
    return createCatchError(err);
  }
};

export const getAllBookCounts = async (data : any) => {
  try
  {
     const pipeline : any = []
     pipeline.push({
      $match : {
        company : {$in : data.company},
        deletedAt : {$exists : false}
      }
     })

     pipeline.push({
      $count : 'totalBooks'
     })

     const result = await LibraryBook.aggregate(pipeline)
     return {
      data: result[0] ? result[0].totalBooks : 0,
      message : 'Retrived Books Counts',
      statusCode : statusCode.success,
      status : 'success'
     }
  }
  catch(err : any)
  {
    return createCatchError(err)
  }
}

export const getAllBookTitleCounts = async (data: any) => {
  try {
    const pipeline: any = [];

    pipeline.push({
      $match: {
        company: { $in: data.company },
        deletedAt: { $exists: false }
      }
    });

    pipeline.push({
      $group: {
        _id: '$title',
        count: { $sum: 1 }
      }
    });

    pipeline.push({
      $project: {
        _id: 0,
        title: '$_id',
        count: 1
      }
    });

    const result = await LibraryBook.aggregate(pipeline);

    return {
      data: result,
      message: 'Retrieved Book Counts by Title',
      statusCode: statusCode.success,
      status: 'success'
    };
  } catch (err: any) {
    return createCatchError(err);
  }
};