/* eslint-disable jsx-a11y/label-has-associated-control */
import React, { ChangeEvent } from 'react';
import { Todo } from '../../types/Todo';
import cn from 'classnames';
import { client } from '../../utils/fetchClient';
import { ErrorMessage } from '../../types/ErrorStatusType';

type TodoItemProps = {
  todo: Todo;
  todos?: Todo[] | null;
  setTodos?: (todos: Todo[]) => void;
  isTempTodo: boolean;
  setErrorMessage?: (errorMessage: ErrorMessage) => void;
  todoIdsToDelete?: number[];
  todoIdsToUpdate?: number[];
  setTodoIdsToDelete?: (idsToDelete: number[]) => void;
  setTodoIdsToUpdate?: (idsToUpdate: number[]) => void;
};

export const TodoItem: React.FC<TodoItemProps> = ({
  todo,
  todos,
  isTempTodo,
  setTodos,
  setErrorMessage,
  todoIdsToDelete,
  setTodoIdsToDelete,
  todoIdsToUpdate,
  setTodoIdsToUpdate,
}) => {
  //const [isLoading, setIsLoading] = useState(false);

  const isLoading =
    todoIdsToUpdate?.includes(todo.id) ||
    todoIdsToDelete?.includes(todo.id) ||
    isTempTodo;

  // useEffect(() => {
  //   if (todoIdsToDelete && todoIdsToDelete.includes(todo.id)) {
  //     setIsLoading(true);
  //   } else {
  //     setIsLoading(false);
  //   }
  // }, [todoIdsToDelete, todo.id]);

  const handleOnClickDelete = () => {
    if (setTodoIdsToDelete && todoIdsToDelete) {
      setTodoIdsToDelete([...todoIdsToDelete, todo.id]);
    }

    client
      .delete(`/todos/${todo.id}`)
      .then(() => {
        if (todos && setTodos) {
          setTodos(todos.filter(todoItem => todoItem.id !== todo.id));
        }
      })
      .catch(() => {
        if (setErrorMessage) {
          setErrorMessage(ErrorMessage.DeleteTodo);
        }
      })
      .finally(() => {
        if (setTodoIdsToDelete && todoIdsToDelete) {
          setTodoIdsToDelete(todoIdsToDelete?.filter(id => id !== todo.id));
        }
      });
  };

  const handleOnChangeCompleted = (event: ChangeEvent<HTMLInputElement>) => {
    if (setTodoIdsToUpdate && todoIdsToUpdate) {
      setTodoIdsToUpdate([...todoIdsToUpdate, todo.id]);
    }

    client
      .patch<Todo>(`/todos/${todo.id}`, { completed: event.target.checked })
      .then(updatedTodo => {
        if (todos) {
          const updatedTodos = todos.map(currentTodo => {
            if (currentTodo.id === updatedTodo.id) {
              return updatedTodo;
            }

            return currentTodo;
          });

          if (setTodos) {
            setTodos(updatedTodos);
          }
        }
      })
      .catch(() => {
        if (setErrorMessage) {
          setErrorMessage(ErrorMessage.UpdateTodos);
        }
      })
      .finally(() => {
        if (setTodoIdsToUpdate && todoIdsToUpdate) {
          setTodoIdsToUpdate(todoIdsToUpdate.filter(id => id !== todo.id));
        }
      });
  };

  return (
    <div data-cy="Todo" className={cn('todo', { completed: todo.completed })}>
      <label className="todo__status-label">
        <input
          data-cy="TodoStatus"
          type="checkbox"
          className="todo__status"
          checked={todo.completed}
          onChange={handleOnChangeCompleted}
        />
      </label>
      <span data-cy="TodoTitle" className="todo__title">
        {todo.title}
      </span>

      <button
        type="button"
        className="todo__remove"
        data-cy="TodoDelete"
        onClick={handleOnClickDelete}
      >
        ×
      </button>

      <div
        data-cy="TodoLoader"
        className={cn('modal overlay', {
          'is-active': isLoading,
        })}
      >
        <div className="modal-background has-background-white-ter" />
        <div className="loader" />
      </div>
    </div>
  );
};
