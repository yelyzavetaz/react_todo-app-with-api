import React from 'react';
import cn from 'classnames';
import { Todo } from '../../types/Todo';
import { client } from '../../utils/fetchClient';
import { ErrorMessage } from '../../types/ErrorStatusType';

type ToggleAllProps = {
  todos: Todo[];
  setTodos: (todos: Todo[]) => void;
  setErrorMessage: (errorMessage: ErrorMessage) => void;
  setTodoIdsToUpdate: (ids: number[]) => void;
};

export const ToggleAll: React.FC<ToggleAllProps> = ({
  todos,
  setTodos,
  setErrorMessage,
  setTodoIdsToUpdate,
}) => {
  const handleOnClickToggle = () => {
    const everyTodoCompleted = todos.every(todo => todo.completed);

    if (everyTodoCompleted) {
      setTodoIdsToUpdate(todos.map(todo => todo.id));

      Promise.allSettled(
        todos.map(currentTodo => {
          return client
            .patch<Todo>(`/todos/${currentTodo.id}`, { completed: false })
            .then(updatedTodo => updatedTodo);
        }),
      )
        .then(results => {
          const updatedTodos = results
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value);

          const notUpdatedTodos = results.some(
            result => result.status === 'rejected',
          );

          if (notUpdatedTodos) {
            if (setErrorMessage) {
              setErrorMessage(ErrorMessage.UpdateTodos);
            }
          }

          if (todos) {
            const newTodos = todos.map(currentTodo => {
              const todosToUpdate = updatedTodos.find(
                updatedTodo => updatedTodo.id === currentTodo.id,
              );

              return todosToUpdate ? todosToUpdate : currentTodo;
            });

            setTodos(newTodos);
          }
        })
        .finally(() => {
          setTodoIdsToUpdate([]);
        });
    } else {
      const notCompletedTodos = todos.filter(todo => !todo.completed);

      setTodoIdsToUpdate(notCompletedTodos.map(todo => todo.id));

      Promise.allSettled(
        notCompletedTodos.map(currentTodo => {
          return client
            .patch<Todo>(`/todos/${currentTodo.id}`, { completed: true })
            .then(updatedTodo => updatedTodo);
        }),
      )
        .then(results => {
          const updatedTodos = results
            .filter(result => result.status === 'fulfilled')
            .map(result => result.value);
          const notUpdatedTodos = results.some(
            result => result.status === 'rejected',
          );

          if (notUpdatedTodos) {
            setErrorMessage(ErrorMessage.UpdateTodos);
          }

          if (todos) {
            const newTodos = todos.map(currentTodo => {
              const updated = updatedTodos.find(
                updatedTodo => updatedTodo.id === currentTodo.id,
              );

              return updated ? updated : currentTodo;
            });

            setTodos(newTodos);
          }
        })
        .finally(() => {
          setTodoIdsToUpdate([]);
        });
    }
  };

  return (
    <button
      type="button"
      className={cn('todoapp__toggle-all', {
        active: todos.every(todo => todo.completed),
      })}
      data-cy="ToggleAllButton"
      onClick={handleOnClickToggle}
    />
  );
};
