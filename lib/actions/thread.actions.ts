'use server';

import { revalidatePath } from 'next/cache';
import Thread from '../models/thread.model';
import User from '../models/user.model';
import { connectToDB } from '../mongoose';

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    connectToDB();
    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    });

    // Update the user model
    await User.findByIdAndUpdate(author, {
      $push: {
        threads: createdThread._id,
      },
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create a thread: ${error.message}`);
  }
}

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
  connectToDB();

  // Calculate the number of threads to skip based on the page number and page size
  const skipAmount = (pageNumber - 1) * pageSize;

  // Fetch all the threads that have no parents (top-level threads...), (a thread that is not a comment/reply)
  const threadsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: 'desc' })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: 'author',
      model: User,
    })
    .populate({
      path: 'children', // Populate the children field
      populate: {
        path: 'author', // Populate the author field within children
        model: User,
        select: '_id name parentId image', // Select only _id and username fields of the author
      },
    });

  // Count the total number of top-level threads i.e., threads that are not comments.
  const totalThreadsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  }); // Get the total count of threads

  const threads = await threadsQuery.exec();

  const isNext = totalThreadsCount > skipAmount + threads.length;

  return { threads, isNext };
}