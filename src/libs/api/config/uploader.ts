interface Props {
    url: string;
    files: File[];
    bearer?: string;
}

const uploader = async ({ url, files, bearer }: Props) => {
    const headersList: HeadersInit = {};

    headersList['Authorization'] = `Bearer ${bearer}`;

    const formData = new FormData();
    files.forEach((file) => {
        formData.append(`files`, file, file.name);
    });

    const response = await fetch([process.env['NEXT_PUBLIC_API_URL'], url].join(''), {
        method: 'PUT',
        headers: headersList,
        body: formData
    });

    return response?.json();
};

export default uploader;
