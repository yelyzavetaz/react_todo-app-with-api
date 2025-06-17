import React from 'react';
import cn from 'classnames';
import { FilterStatusType } from '../../types/FilterStatusType';
import { Todo } from '../../types/Todo';
import { client } from '../../utils/fetchClient';
import { ErrorMessage } from '../../types/ErrorStatusType';

type FooterProps = {
  todos: Todo[];
  setTodos: (todos: Todo[]) => void;
  filterStatus: FilterStatusType;
  setFilterStatus: (filterStatus: FilterStatusType) => void;
  completedTodoExists: boolean;
  numberOfNotCompletedTodos: number;
  setTodoIdsToDelete: (todoIds: number[]) => void;
  setErrorMessage?: (errorMessage: ErrorMessage) => void;
};

export const Footer: React.FC<FooterProps> = ({
  filterStatus,
  setFilterStatus,
  completedTodoExists,
  numberOfNotCompletedTodos,
  todos,
  setTodos,
  setTodoIdsToDelete,
  setErrorMessage,
}) => {
  const handleChangeFilterStatus = (filterStatusType: FilterStatusType) => {
    setFilterStatus(filterStatusType);
  };

  const handleClearCompleted = () => {
    const completedTodosIds = todos
      .filter(todo => todo.completed)
      .map(todo => todo.id);

    setTodoIdsToDelete(completedTodosIds);

    Promise.allSettled(
      completedTodosIds.map(todoId => {
        return client.delete(`/todos/${todoId}`).then(() => todoId);
      }),
    )
      .then(results => {
        const deletedIds = results
          .filter(result => result.status === 'fulfilled')
          .map(result => result.value);

        const notDeletedIds = results.some(
          result => result.status === 'rejected',
        );

        if (notDeletedIds) {
          if (setErrorMessage) {
            setErrorMessage(ErrorMessage.DeleteTodo);
          }
        }

        if (todos && setTodos) {
          setTodos(todos.filter(todoItem => !deletedIds.includes(todoItem.id)));
        }
      })
      .finally(() => {
        setTodoIdsToDelete([]);
      });
  };

  return (
    <footer className="todoapp__footer" data-cy="Footer">
      <span className="todo-count" data-cy="TodosCounter">
        {`${numberOfNotCompletedTodos} items left`}
      </span>

      <nav className="filter" data-cy="Filter">
        <a
          href="#/"
          className={cn('filter__link', {
            selected: filterStatus === FilterStatusType.All,
          })}
          data-cy="FilterLinkAll"
          onClick={() => handleChangeFilterStatus(FilterStatusType.All)}
        >
          All
        </a>

        <a
          href="#/active"
          className={cn('filter__link', {
            selected: filterStatus === FilterStatusType.Active,
          })}
          data-cy="FilterLinkActive"
          onClick={() => handleChangeFilterStatus(FilterStatusType.Active)}
        >
          Active
        </a>

        <a
          href="#/completed"
          className={cn('filter__link', {
            selected: filterStatus === FilterStatusType.Completed,
          })}
          data-cy="FilterLinkCompleted"
          onClick={() => handleChangeFilterStatus(FilterStatusType.Completed)}
        >
          Completed
        </a>
      </nav>

      <button
        type="button"
        className="todoapp__clear-completed"
        data-cy="ClearCompletedButton"
        disabled={!completedTodoExists}
        onClick={handleClearCompleted}
      >
        Clear completed
      </button>
    </footer>
  );
};
