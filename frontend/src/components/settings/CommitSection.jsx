import React from 'react';
import Textarea from '../ui/TextArea';

const CommitSection = ({
    status,
    commitMessage,
    setCommitMessage,
    hasIncomingChanges,
    funMessage
}) => {
    const hasUnstagedChanges = status.outgoing_changes.some(
        change => !change.staged || (change.staged && change.modified)
    );
    const hasStagedChanges = status.outgoing_changes.some(
        change => change.staged
    );
    const hasAnyChanges = status.outgoing_changes.length > 0;

    return (
        <div className='mt-4'>
            {hasAnyChanges || hasIncomingChanges ? (
                <>
                    {hasStagedChanges && (
                        <>
                            <h3 className='text-sm font-semibold text-gray-100 mb-4'>
                                Commit Message:
                            </h3>
                            <Textarea
                                value={commitMessage}
                                onChange={e => setCommitMessage(e.target.value)}
                                placeholder='Enter your commit message here...'
                                className='w-full p-2 text-sm text-gray-200 bg-gray-600 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y h-[75px] mb-2'
                            />
                        </>
                    )}
                </>
            ) : (
                <div className='text-gray-300 text-sm italic'>{funMessage}</div>
            )}
        </div>
    );
};

export default CommitSection;
