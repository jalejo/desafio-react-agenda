import { createContext, useContext, useState, ReactNode } from "react"

interface Contact {
  key: string;
  id: string;
  name: string;
  description: string;
  photo: string;
  action: string;
}

interface ApiContextProps {
  contacts: Contact[];
  totalContacts: number;
  currentPage: number;
  currentLimit: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  setCurrentLimit: React.Dispatch<React.SetStateAction<number>>;
  getContacts: (searchText?: string, page?: number, pageSize?: number) => Promise<void>;
  addContact: (contact: Partial<Contact>) => Promise<void>;
  removeContact: (id: string) => Promise<void>;
  isLoading: boolean;
  errorMessage: string | null;
  clearError: () => void;
}

const ApiContext = createContext<ApiContextProps | undefined>(undefined);

const APIurl = 'http://localhost:9000/api/users'

export const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [totalContacts, setTotalContacts] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentLimit, setCurrentLimit] = useState<number>(6);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const clearError = () => setErrorMessage(null);

  /************** GET CONTACT LIST  BY PAGINATION AND SEARCH BAR **************/

  const getContacts = async (searchText?: string, page?: number, pageSize?: number) => {

    setIsLoading(true);
    setErrorMessage(null);

    try {
      //Se refactoriza error en la función getContacts para que pueda ser utilizada tanto en el useEffect de carga inicial, como en la función de búsqueda y paginación.

      const pageToUse = page ?? currentPage;
      const limitToUse = pageSize ?? currentLimit;


      const params = new URLSearchParams();

      const q = searchText?.trim();
      if (q) { params.set('q', q)};

      params.set('_page', pageToUse.toString());
      params.set('_limit', limitToUse.toString());

      const url = `${APIurl}?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data : Contact[] = await response.json();
      setContacts(data);

      //Get Total of users: para la paginación se necesita el total de registros, 'X-Total-Count' devuelve un string con el total, por eso requiere un parseInt, y una validación de nulidad - [Depende del Server, se recomienda hacer pruebas antes]   

      const totalCount = parseInt(response.headers.get('X-Total-Count') ?? '0', 10);
      setTotalContacts(totalCount);


      if ( page !== undefined ) setCurrentPage(page);
      if ( pageSize !== undefined ) setCurrentLimit(pageSize);

    } catch (error : any ) {

      const msg = error?.message?.includes("Failed to fetch")
      ? "Error de conexión: No se pudo conectar al servidor. Por favor, intente nuevamente más tarde." 
      : "Error al obtener contactos: " + error?.message;
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  }

  /************** ADD NEW CONTACT **************/

  const addContact = async (contactData: Partial<Contact>) => {
    try {
      const response = await fetch(APIurl, {
        method: 'POST',
        headers: {
          Accept: "application/json"
        },
        body: JSON.stringify(contactData)

      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      getContacts();
    } catch (error) {
      console.error('Error creating Contact:', error)
    }
  }

  /************** DELETE CONTACT by ID **************/

  const removeContact = async (id: string) => {
    try {
      const response = await fetch(`${APIurl}/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
      getContacts();
    } catch (error) {
      console.error('Error removing contact:', error);
    }

  }

  const contextValue: ApiContextProps = {
    contacts,
    totalContacts,
    getContacts,
    addContact,
    removeContact,
    currentPage,
    currentLimit,
    setCurrentPage,
    setCurrentLimit,
    isLoading,
    errorMessage,
    clearError
  };

  return <ApiContext.Provider value={contextValue}>{children}</ApiContext.Provider>

};

export const useApi = (): ApiContextProps => {
  const context = useContext(ApiContext);
  if (!context) {
    throw new Error('useApi must be used on an ApiProvider')
  }
  return context;
};
