import { createContext, PropsWithChildren, useContext, useMemo } from 'react'

import { Project, useProjectDetailQuery } from 'data/projects/project-detail-query'
import { PROJECT_STATUS } from 'lib/constants'
import { AiAssistantStateContextProvider } from 'state/ai-assistant-state'
import { DatabaseSelectorStateContextProvider } from 'state/database-selector'
import { RoleImpersonationStateContextProvider } from 'state/role-impersonation-state'
import { StorageExplorerStateContextProvider } from 'state/storage-explorer'
import { TableEditorStateContextProvider } from 'state/table-editor'
import { TabsStateContextProvider } from 'state/tabs'

export interface ProjectContextType {
  project?: Project
  isLoading: boolean
}

const ProjectContext = createContext<ProjectContextType>({
  project: undefined,
  isLoading: true,
})

export default ProjectContext

export const useProjectContext = () => useContext(ProjectContext)

type ProjectContextProviderProps = {
  projectRef: string | undefined
}

export const ProjectContextProvider = ({
  projectRef,
  children,
}: PropsWithChildren<ProjectContextProviderProps>) => {
  const { data: selectedProject, isLoading } = useProjectDetailQuery({ ref: projectRef })

  const value = useMemo<ProjectContextType>(() => {
    return {
      project: selectedProject,
      isLoading: isLoading,
    }
  }, [selectedProject, isLoading])

  return (
    <ProjectContext.Provider value={value}>
      <TableEditorStateContextProvider key={`table-editor-state-${projectRef}`}>
        <TabsStateContextProvider key={`tabs-state-${projectRef}`} projectRef={projectRef}>
          <AiAssistantStateContextProvider
            key={`ai-assistant-state-${projectRef}`}
            projectRef={projectRef}
          >
            <StorageExplorerStateContextProvider key={`storage-explorer-state-${projectRef}`}>
              <DatabaseSelectorStateContextProvider key={`database-selector-state-${projectRef}`}>
                <RoleImpersonationStateContextProvider
                  key={`role-impersonation-state-${projectRef}`}
                >
                  {children}
                </RoleImpersonationStateContextProvider>
              </DatabaseSelectorStateContextProvider>
            </StorageExplorerStateContextProvider>
          </AiAssistantStateContextProvider>
        </TabsStateContextProvider>
      </TableEditorStateContextProvider>
    </ProjectContext.Provider>
  )
}

export const useIsProjectActive = () => {
  const { project } = useProjectContext()
  return project?.status === PROJECT_STATUS.ACTIVE_HEALTHY
}
