import { String } from 'runtypes'
import {
    Task,
    QuickAddTaskResponse,
    Project,
    Label,
    User,
    Section,
    Comment,
} from './types/entities'
import {
    AddLabelArgs,
    AddProjectArgs,
    AddSectionArgs,
    AddProjectCommentArgs,
    AddTaskArgs,
    AddTaskCommentArgs,
    GetProjectCommentsArgs,
    GetTaskCommentsArgs,
    GetTasksArgs,
    UpdateCommentArgs,
    UpdateLabelArgs,
    UpdateProjectArgs,
    UpdateSectionArgs,
    UpdateTaskArgs,
    QuickAddTaskArgs,
    RenameSharedLabelArgs,
    RemoveSharedLabelArgs,
} from './types/requests'
import { request, isSuccess } from './restClient'
import { getTaskFromQuickAddResponse } from './utils/taskConverters'
import {
    getRestBaseUri,
    getSyncBaseUri,
    ENDPOINT_REST_TASKS,
    ENDPOINT_REST_PROJECTS,
    ENDPOINT_SYNC_QUICK_ADD,
    ENDPOINT_REST_TASK_CLOSE,
    ENDPOINT_REST_TASK_REOPEN,
    ENDPOINT_REST_LABELS,
    ENDPOINT_REST_PROJECT_COLLABORATORS,
    ENDPOINT_REST_SECTIONS,
    ENDPOINT_REST_COMMENTS,
    ENDPOINT_REST_LABELS_SHARED,
    ENDPOINT_REST_LABELS_SHARED_RENAME,
    ENDPOINT_REST_LABELS_SHARED_REMOVE,
} from './consts/endpoints'
import {
    validateComment,
    validateCommentArray,
    validateLabel,
    validateLabelArray,
    validateProject,
    validateProjectArray,
    validateSection,
    validateSectionArray,
    validateTask,
    validateTaskArray,
    validateUserArray,
} from './utils/validators'

/**
 * Joins path segments using `/` separator.
 * @param segments A list of **valid** path segments.
 * @returns A joined path.
 */
function generatePath(...segments: string[]): string {
    return segments.join('/')
}

export class TodoistApi {
    authToken: string

    constructor(authToken: string, baseUrl?: string) {
        this.authToken = authToken

        this.restApiBase = getRestBaseUri(baseUrl)
        this.syncApiBase = getSyncBaseUri(baseUrl)
    }

    private restApiBase: string
    private syncApiBase: string

    async getTask(id: string): Promise<Task> {
        String.check(id)
        const response = await request<Task>(
            'GET',
            this.restApiBase,
            generatePath(ENDPOINT_REST_TASKS, id),
            this.authToken,
        )

        return validateTask(response.data)
    }

    async getTasks(args?: GetTasksArgs): Promise<Task[]> {
        const response = await request<Task[]>(
            'GET',
            this.restApiBase,
            ENDPOINT_REST_TASKS,
            this.authToken,
            args,
        )

        return validateTaskArray(response.data)
    }

    async addTask(args: AddTaskArgs, requestId?: string): Promise<Task> {
        const response = await request<Task>(
            'POST',
            this.restApiBase,
            ENDPOINT_REST_TASKS,
            this.authToken,
            args,
            requestId,
        )

        return validateTask(response.data)
    }

    async quickAddTask(args: QuickAddTaskArgs): Promise<Task> {
        const response = await request<QuickAddTaskResponse>(
            'POST',
            this.syncApiBase,
            ENDPOINT_SYNC_QUICK_ADD,
            this.authToken,
            args,
        )

        const task = getTaskFromQuickAddResponse(response.data)

        return validateTask(task)
    }

    async updateTask(id: string, args: UpdateTaskArgs, requestId?: string): Promise<Task> {
        String.check(id)
        const response = await request(
            'POST',
            this.restApiBase,
            generatePath(ENDPOINT_REST_TASKS, id),
            this.authToken,
            args,
            requestId,
        )
        return validateTask(response.data)
    }

    async closeTask(id: string, requestId?: string): Promise<boolean> {
        String.check(id)
        const response = await request(
            'POST',
            this.restApiBase,
            generatePath(ENDPOINT_REST_TASKS, id, ENDPOINT_REST_TASK_CLOSE),
            this.authToken,
            undefined,
            requestId,
        )
        return isSuccess(response)
    }

    async reopenTask(id: string, requestId?: string): Promise<boolean> {
        String.check(id)
        const response = await request(
            'POST',
            this.restApiBase,
            generatePath(ENDPOINT_REST_TASKS, id, ENDPOINT_REST_TASK_REOPEN),
            this.authToken,
            undefined,
            requestId,
        )
        return isSuccess(response)
    }

    async deleteTask(id: string, requestId?: string): Promise<boolean> {
        String.check(id)
        const response = await request(
            'DELETE',
            this.restApiBase,
            generatePath(ENDPOINT_REST_TASKS, id),
            this.authToken,
            undefined,
            requestId,
        )
        return isSuccess(response)
    }

    async getProject(id: string): Promise<Project> {
        String.check(id)
        const response = await request<Project>(
            'GET',
            this.restApiBase,
            generatePath(ENDPOINT_REST_PROJECTS, id),
            this.authToken,
        )

        return validateProject(response.data)
    }

    async getProjects(): Promise<Project[]> {
        const response = await request<Project[]>(
            'GET',
            this.restApiBase,
            ENDPOINT_REST_PROJECTS,
            this.authToken,
        )

        return validateProjectArray(response.data)
    }

    async addProject(args: AddProjectArgs, requestId?: string): Promise<Project> {
        const response = await request<Project>(
            'POST',
            this.restApiBase,
            ENDPOINT_REST_PROJECTS,
            this.authToken,
            args,
            requestId,
        )

        return validateProject(response.data)
    }

    async updateProject(id: string, args: UpdateProjectArgs, requestId?: string): Promise<Project> {
        String.check(id)
        const response = await request(
            'POST',
            this.restApiBase,
            generatePath(ENDPOINT_REST_PROJECTS, id),
            this.authToken,
            args,
            requestId,
        )
        return validateProject(response.data)
    }

    async deleteProject(id: string, requestId?: string): Promise<boolean> {
        String.check(id)
        const response = await request(
            'DELETE',
            this.restApiBase,
            generatePath(ENDPOINT_REST_PROJECTS, id),
            this.authToken,
            undefined,
            requestId,
        )
        return isSuccess(response)
    }

    async getProjectCollaborators(projectId: string): Promise<User[]> {
        String.check(projectId)
        const response = await request<User[]>(
            'GET',
            this.restApiBase,
            generatePath(ENDPOINT_REST_PROJECTS, projectId, ENDPOINT_REST_PROJECT_COLLABORATORS),
            this.authToken,
        )

        return validateUserArray(response.data)
    }

    async getSections(projectId?: string): Promise<Section[]> {
        const response = await request<Section[]>(
            'GET',
            this.restApiBase,
            ENDPOINT_REST_SECTIONS,
            this.authToken,
            projectId ? { projectId } : undefined,
        )

        return validateSectionArray(response.data)
    }

    async getSection(id: string): Promise<Section> {
        String.check(id)
        const response = await request<Section>(
            'GET',
            this.restApiBase,
            generatePath(ENDPOINT_REST_SECTIONS, id),
            this.authToken,
        )

        return validateSection(response.data)
    }

    async addSection(args: AddSectionArgs, requestId?: string): Promise<Section> {
        const response = await request<Section>(
            'POST',
            this.restApiBase,
            ENDPOINT_REST_SECTIONS,
            this.authToken,
            args,
            requestId,
        )

        return validateSection(response.data)
    }

    async updateSection(id: string, args: UpdateSectionArgs, requestId?: string): Promise<Section> {
        String.check(id)
        const response = await request(
            'POST',
            this.restApiBase,
            generatePath(ENDPOINT_REST_SECTIONS, id),
            this.authToken,
            args,
            requestId,
        )
        return validateSection(response.data)
    }

    async deleteSection(id: string, requestId?: string): Promise<boolean> {
        String.check(id)
        const response = await request(
            'DELETE',
            this.restApiBase,
            generatePath(ENDPOINT_REST_SECTIONS, id),
            this.authToken,
            undefined,
            requestId,
        )
        return isSuccess(response)
    }

    /**
     * Fetches a personal label
     */
    async getLabel(id: string): Promise<Label> {
        String.check(id)
        const response = await request<Label>(
            'GET',
            this.restApiBase,
            generatePath(ENDPOINT_REST_LABELS, id),
            this.authToken,
        )

        return validateLabel(response.data)
    }

    /**
     * Fetches the personal labels
     */
    async getLabels(): Promise<Label[]> {
        const response = await request<Label[]>(
            'GET',
            this.restApiBase,
            ENDPOINT_REST_LABELS,
            this.authToken,
        )

        return validateLabelArray(response.data)
    }

    /**
     * Adds a personal label
     */
    async addLabel(args: AddLabelArgs, requestId?: string): Promise<Label> {
        const response = await request<Label>(
            'POST',
            this.restApiBase,
            ENDPOINT_REST_LABELS,
            this.authToken,
            args,
            requestId,
        )

        return validateLabel(response.data)
    }

    /**
     * Updates a personal label
     */
    async updateLabel(id: string, args: UpdateLabelArgs, requestId?: string): Promise<Label> {
        String.check(id)
        const response = await request(
            'POST',
            this.restApiBase,
            generatePath(ENDPOINT_REST_LABELS, id),
            this.authToken,
            args,
            requestId,
        )
        return validateLabel(response.data)
    }

    /**
     * Deletes a personal label
     */
    async deleteLabel(id: string, requestId?: string): Promise<boolean> {
        String.check(id)
        const response = await request(
            'DELETE',
            this.restApiBase,
            generatePath(ENDPOINT_REST_LABELS, id),
            this.authToken,
            undefined,
            requestId,
        )
        return isSuccess(response)
    }

    async getSharedLabels(): Promise<string[]> {
        const response = await request<string[]>(
            'GET',
            this.restApiBase,
            ENDPOINT_REST_LABELS_SHARED,
            this.authToken,
        )

        return response.data
    }

    async renameSharedLabel(args: RenameSharedLabelArgs): Promise<void> {
        await request<void>(
            'POST',
            this.restApiBase,
            ENDPOINT_REST_LABELS_SHARED_RENAME,
            this.authToken,
            args,
        )
    }

    async removeSharedLabel(args: RemoveSharedLabelArgs): Promise<void> {
        await request<void>(
            'POST',
            this.restApiBase,
            ENDPOINT_REST_LABELS_SHARED_REMOVE,
            this.authToken,
            args,
        )
    }

    async getComments(args: GetTaskCommentsArgs | GetProjectCommentsArgs): Promise<Comment[]> {
        const response = await request<Comment[]>(
            'GET',
            this.restApiBase,
            ENDPOINT_REST_COMMENTS,
            this.authToken,
            args,
        )

        return validateCommentArray(response.data)
    }

    async getComment(id: string): Promise<Comment> {
        String.check(id)
        const response = await request<Comment>(
            'GET',
            this.restApiBase,
            generatePath(ENDPOINT_REST_COMMENTS, id),
            this.authToken,
        )

        return validateComment(response.data)
    }

    async addComment(
        args: AddTaskCommentArgs | AddProjectCommentArgs,
        requestId?: string,
    ): Promise<Comment> {
        const response = await request<Comment>(
            'POST',
            this.restApiBase,
            ENDPOINT_REST_COMMENTS,
            this.authToken,
            args,
            requestId,
        )

        return validateComment(response.data)
    }

    async updateComment(id: string, args: UpdateCommentArgs, requestId?: string): Promise<Comment> {
        String.check(id)
        const response = await request<boolean>(
            'POST',
            this.restApiBase,
            generatePath(ENDPOINT_REST_COMMENTS, id),
            this.authToken,
            args,
            requestId,
        )
        return validateComment(response.data)
    }

    async deleteComment(id: string, requestId?: string): Promise<boolean> {
        String.check(id)
        const response = await request(
            'DELETE',
            this.restApiBase,
            generatePath(ENDPOINT_REST_COMMENTS, id),
            this.authToken,
            undefined,
            requestId,
        )
        return isSuccess(response)
    }
}
