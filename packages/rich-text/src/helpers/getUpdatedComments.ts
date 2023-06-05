import { InlineComment } from 'RichTextEditor';

export const findCurrentComments = (
  document: any,
  path: string,
  comments: (InlineComment & { newRange?: string[] })[]
): void => {
  if ('data' in document && 'comment' in document.data) {
    const oldComment = comments.find((comment) => {
      return comment.sys.id === document.data.comment.sys.id;
    });

    if (oldComment) {
      if ('newRange' in oldComment && (oldComment.newRange as string[]).length > 0) {
        (oldComment.newRange as string[]).push(path);
      } else {
        oldComment.newRange = [path];
      }
      // check if path is already in locations
      if (!oldComment.metadata.range.includes(path)) {
        oldComment.metadata.range.push(path);
      }
    }
  }

  if ('content' in document) {
    for (let i = 0; i < document.content.length; i++) {
      if (path.startsWith('.')) {
        path = path.slice(1);
      }
      findCurrentComments(document.content[i], `${path}.content[${i}]`, comments);
    }
  }
};

export const getUpdatedComments = (
  document: any,
  commentsSdk: {
    get: () => InlineComment[];
    create: () => void;
    update: (commentId: string, comment: InlineComment) => void;
    delete: (commentId: string) => void;
  }
): InlineComment[] => {
  const currentComments = commentsSdk.get() as (InlineComment & { newRange?: string[] })[];

  // modifies current comments
  findCurrentComments(document, '', currentComments);

  return currentComments.map((comment) => {
    if (comment.newRange && comment.metadata.range.sort() !== comment.newRange?.sort()) {
      if (comment.newRange.length === 0) {
        // comment no longer exists, delete
        commentsSdk.delete(comment.sys.id);
      } else {
        // update comment
        comment.metadata.range = comment.newRange;
        delete comment.newRange;

        // probably won't work?
        commentsSdk.update(comment.sys.id, comment);
      }
    }

    return comment;
  });
};

export const findRanges = (document: any, path: string, ranges: string[] = []): any => {
  if ('data' in document && 'comment' in document.data && document.data.comment.temp) {
    console.log('PATH FOUND: ', path);

    ranges.push(path);
  }

  if ('children' in document) {
    for (let i = 0; i < document.children.length; i++) {
      if (path.startsWith('.')) {
        path = path.slice(1);
      }
      ranges = ranges.concat(findRanges(document.children[i], `${path}.children[${i}]`, ranges));
    }

    console.log('Finished! ', ranges);

    return new Set(ranges.filter((range) => range));
  }
};